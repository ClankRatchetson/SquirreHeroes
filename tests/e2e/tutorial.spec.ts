import { test, expect } from "@playwright/test";

/**
 * Preuve du tutoriel de premier combat (Phase 8 lot 1) : affiché sur une
 * sauvegarde fraîche dès le premier combat, jamais réaffiché une fois
 * passé/terminé — persisté via `meta.tutorialCompleted`, cf. migration
 * v4->v5.
 */
test("le tutoriel s'affiche au premier combat et ne réapparaît jamais après l'avoir passé", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.locator('[data-testid="run-node"][data-status="disponible"]').first().click();

  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("tutorial-overlay")).toBeVisible();

  await page.getByTestId("tutorial-skip").click();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();

  // Persisté : après rechargement + reprise, le tutoriel ne réapparaît pas, même en combat.
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();
});

test("terminer les 5 étapes du tutoriel le passe aussi définitivement", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.locator('[data-testid="run-node"][data-status="disponible"]').first().click();

  await expect(page.getByTestId("tutorial-overlay")).toBeVisible();
  for (let i = 0; i < 4; i += 1) {
    await page.getByTestId("tutorial-next").click();
  }
  // 5ᵉ et dernière étape : le bouton "Suivant" devient "C'est parti !".
  await expect(page.getByRole("button", { name: "C'est parti !" })).toBeVisible();
  await page.getByRole("button", { name: "C'est parti !" }).click();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("tutorial-overlay")).not.toBeVisible();
});
