import { test, expect } from "@playwright/test";

/**
 * Preuve du livrable littéral de la Phase 4 : fermer l'application en plein
 * combat et retrouver l'état exact au relancement. La reprise passe par un
 * bouton menu explicite (décision UX actée), pas une reprise automatique —
 * le menu doit donc rester visible après rechargement, avant que le joueur
 * ne choisisse de reprendre.
 */
test("fermer l'application en plein combat et retrouver l'état exact au relancement", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.locator('[data-testid="run-node"][data-status="disponible"]').first().click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();

  const heroHpBefore = await page.getByTestId("hero-hp").textContent();
  const enemyHpBefore = await page.getByTestId("enemy-hp").first().textContent();
  const turnBefore = await page.getByTestId("turn-number").textContent();
  const handSizeBefore = await page.getByTestId("card-in-hand").count();

  await page.reload();

  // Reprise via bouton menu, jamais automatique.
  await expect(page.getByRole("heading", { name: "Squirrel Heroes" })).toBeVisible();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("hero-hp")).toHaveText(heroHpBefore ?? "");
  await expect(page.getByTestId("enemy-hp").first()).toHaveText(enemyHpBefore ?? "");
  await expect(page.getByTestId("turn-number")).toHaveText(turnBefore ?? "");
  await expect(page.getByTestId("card-in-hand")).toHaveCount(handSizeBefore);
});

test("démarrer une nouvelle run alors qu'une run est en cours demande confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Reprendre la run" })).toBeVisible();

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByTestId("confirm-overwrite")).toBeVisible();

  // Annuler préserve la run existante.
  await page.getByRole("button", { name: "Annuler" }).click();
  await expect(page.getByTestId("confirm-overwrite")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Reprendre la run" })).toBeVisible();

  // Confirmer navigue vers la sélection de héros ; démarrer la run écrase l'ancienne.
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Écraser et recommencer" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();
  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
});
