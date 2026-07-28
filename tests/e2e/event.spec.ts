import { test, expect } from "@playwright/test";
import { RUN_ACTS } from "../../src/content/acts";
import { seedSaveFile } from "./helpers/seed-save";

/**
 * Preuve e2e directe des événements de run — jamais couverts jusqu'ici
 * (`suite e2e complète`, Phase 8). Amorçage direct en
 * `phase:"evenement"` avec "La Cachette de Provisions" (2 choix simples,
 * cf. `src/content/events/cachette_de_provisions.json`) plutôt que de
 * faire jouer un bot jusqu'à un nœud d'événement tiré par RNG.
 */
function eventCurrentRun(): Record<string, unknown> {
  return {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp: 80,
    deck: [{ runCardId: "run-card-0", cardId: "carapace_de_granit", upgraded: false }],
    noisettes: 20,
    map: {
      actId: "acte_1",
      floorCount: 1,
      nodes: [{ id: "event0", floor: 0, type: "evenement", eventId: "cachette_de_provisions", edges: [] }],
    },
    currentNodeId: "event0",
    visitedNodeIds: ["event0"],
    phase: "evenement",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: null,
    pendingShop: null,
    pendingEventId: "cachette_de_provisions",
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

test("l'écran d'événement affiche son titre, son texte et ses choix", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: eventCurrentRun() });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await expect(page.getByRole("heading", { name: "La Cachette de Provisions" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Grignoter sur place" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tout emporter" })).toBeVisible();
});

test("choisir une option d'événement applique son effet et ramène à la carte", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: eventCurrentRun() });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  // "Tout emporter" : +18 Noisettes, sans effet sur les PV.
  await page.getByRole("button", { name: "Tout emporter" }).click();

  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
  await expect(page.getByTestId("run-noisettes")).toHaveText("Noisettes 38");
  await expect(page.getByTestId("run-hero-hp")).toHaveText("PV 80/80");
});
