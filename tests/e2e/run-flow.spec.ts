import { test, expect, type Locator } from "@playwright/test";

/**
 * Preuve du câblage carte → nœud → combat → retour carte. Ne vérifie PAS
 * l'issue exhaustive victoire/défaite (déjà couverte de façon déterministe
 * et rapide côté moteur par `reducer.test.ts`/`map-generation.test.ts`) —
 * l'e2e a un coût/risque de flakiness plus élevé pour la même garantie.
 */
async function tryClick(locator: Locator, timeout = 1500): Promise<boolean> {
  try {
    await locator.click({ timeout });
    return true;
  } catch {
    return false;
  }
}

test("une run est jouable au tap : carte -> nœud -> combat -> retour à un écran hors combat", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();

  const availableNode = page.locator('[data-testid="run-node"][data-status="disponible"]').first();
  await expect(availableNode).toBeVisible();
  await availableNode.click();

  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("card-in-hand")).toHaveCount(5);

  // Politique gloutonne bornée (même esprit que scripts/play-run.ts) : priorité à
  // l'attaque (cible requise) pour vraiment faire baisser les PV ennemis — une carte
  // "simple" (bloc, etc.) prioritaire en premier peut être piochée indéfiniment sans
  // jamais faire de dégât et empêcher le combat de se terminer. Chaque action utilise
  // un timeout court et non bloquant (le tour ennemi étalé dans le temps désactive
  // temporairement les cartes/le bouton fin de tour, ce qui ne doit jamais faire
  // échouer une tentative de clic isolée).
  const SAFETY_CAP = 40;
  for (let i = 0; i < SAFETY_CAP; i += 1) {
    const stillInCombat = await page.getByTestId("hero-panel").isVisible().catch(() => false);
    if (!stillInCombat) {
      break;
    }
    await page.waitForTimeout(100);

    const targetingCard = page
      .locator('[data-testid="card-in-hand"][data-playable="true"][data-needs-target="true"]')
      .first();
    if (await tryClick(targetingCard)) {
      await tryClick(page.getByTestId("enemy-target").first());
      continue;
    }

    const simpleCard = page
      .locator('[data-testid="card-in-hand"][data-playable="true"][data-needs-target="false"]')
      .first();
    if (await tryClick(simpleCard)) {
      continue;
    }

    await tryClick(page.getByTestId("end-turn-button"));
  }

  // Le combat s'est résolu d'une façon ou d'une autre : l'écran de combat n'est plus affiché.
  await expect(page.getByTestId("hero-panel")).not.toBeVisible();
});
