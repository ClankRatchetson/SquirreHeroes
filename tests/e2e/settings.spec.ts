import { test, expect } from "@playwright/test";

/**
 * Preuve de l'écran de Réglages (Phase 8 lot 2) : "Revoir le tutoriel"
 * réaffiche le tutoriel au combat suivant, "Réinitialiser la progression"
 * efface réellement la sauvegarde (persistée, pas juste l'état React).
 */
test("Revoir le tutoriel réaffiche le tutoriel de premier combat au combat suivant", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.locator('[data-testid="run-node"][data-status="disponible"]').first().click();

  // Premier combat jamais joué : tutoriel déjà affiché — on le passe pour revenir au menu.
  await expect(page.getByTestId("tutorial-overlay")).toBeVisible();
  await page.getByTestId("tutorial-skip").click();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();

  // Revenir au menu, ouvrir les Réglages, revoir le tutoriel.
  await page.goto("/");
  await page.getByRole("button", { name: "Réglages" }).click();
  await page.getByTestId("settings-replay-tutorial").click();
  await expect(page.getByTestId("settings-tutorial-confirmation")).toBeVisible();
  await page.getByRole("button", { name: "Retour" }).click();

  // Reprendre la run : le tutoriel réapparaît sur le combat déjà en cours.
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("tutorial-overlay")).toBeVisible();
});

test("Réinitialiser la progression efface réellement la run et la méta-progression, y compris après rechargement", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.locator('[data-testid="run-node"][data-status="disponible"]').first().waitFor();

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Reprendre la run" })).toBeVisible();

  await page.getByRole("button", { name: "Réglages" }).click();
  await page.getByTestId("settings-reset-progression").click();
  await expect(page.getByTestId("confirm-reset-progression")).toBeVisible();

  // Annuler préserve la run.
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByTestId("confirm-reset-progression")).not.toBeVisible();
  await page.getByRole("button", { name: "Retour" }).click();
  await expect(page.getByRole("button", { name: "Reprendre la run" })).toBeVisible();

  // Confirmer efface tout et ramène au menu, sans bouton de reprise.
  await page.getByRole("button", { name: "Réglages" }).click();
  await page.getByTestId("settings-reset-progression").click();
  await page.getByRole("button", { name: "Tout effacer" }).click();
  await expect(page.getByRole("button", { name: "Nouvelle run" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reprendre la run" })).not.toBeVisible();

  // Persisté, pas juste l'état React en mémoire.
  await page.reload();
  await expect(page.getByRole("button", { name: "Nouvelle run" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reprendre la run" })).not.toBeVisible();
});
