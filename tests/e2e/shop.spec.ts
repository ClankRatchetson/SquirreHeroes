import { test, expect } from "@playwright/test";
import { RUN_ACTS } from "../../src/content/acts";
import { seedSaveFile } from "./helpers/seed-save";

/**
 * Preuve e2e directe de la boutique — jamais couverte jusqu'ici (`suite
 * e2e complète`, Phase 8). Amorçage direct en `phase:"boutique"` plutôt
 * que de faire jouer un bot jusqu'à un nœud de boutique tiré par RNG.
 */
function shopCurrentRun(): Record<string, unknown> {
  return {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp: 80,
    deck: [{ runCardId: "run-card-0", cardId: "carapace_de_granit", upgraded: false }],
    noisettes: 200,
    map: { actId: "acte_1", floorCount: 1, nodes: [{ id: "shop0", floor: 0, type: "boutique", edges: [] }] },
    currentNodeId: "shop0",
    visitedNodeIds: ["shop0"],
    phase: "boutique",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: null,
    pendingShop: {
      cardsForSale: [{ cardId: "sprint", price: 40, purchased: false }],
      upgradePrice: 50,
      removePrice: 35,
    },
    pendingEventId: null,
    rng: { state: 123456 },
    nextRunCardSeq: 1,
    noisettesBonusPerCombat: 0,
    familiarId: null,
    familiarPassive: null,
    acts: RUN_ACTS,
    actIndex: 0,
    bossesDefeatedThisRun: [],
    pendingActTransition: false,
  };
}

test("acheter une carte en boutique la déduit des Noisettes et l'ajoute au deck", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: shopCurrentRun() });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await expect(page.getByTestId("run-noisettes")).toHaveText("Noisettes 200");
  await expect(page.getByTestId("shop-buy-sprint")).toBeEnabled();

  await page.getByTestId("shop-buy-sprint").click();

  await expect(page.getByTestId("run-noisettes")).toHaveText("Noisettes 160");
  await expect(page.getByTestId("shop-buy-sprint")).toBeDisabled();
});

test("améliorer une carte du deck en boutique la marque améliorée et déduit son prix", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: shopCurrentRun() });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await page.getByTestId("shop-upgrade-run-card-0").click();

  await expect(page.getByTestId("run-noisettes")).toHaveText("Noisettes 150");
  await expect(page.getByText("Carapace de granit+")).toBeVisible();
  await expect(page.getByTestId("shop-upgrade-run-card-0")).toBeDisabled();
});

test("quitter la boutique ramène à la carte de la run", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: shopCurrentRun() });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await page.getByTestId("shop-leave").click();

  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
});
