import { test, expect } from "@playwright/test";
import { RUN_ACTS } from "../../src/content/acts";
import { seedSaveFile, readSavedCurrentRun } from "./helpers/seed-save";

/**
 * Preuve e2e directe du feu de camp — jamais couvert jusqu'ici (`suite
 * e2e complète`, Phase 8). Amorçage direct en `phase:"feu_de_camp"`.
 * Ni le soin ni l'amélioration n'ont d'indicateur visible DANS l'écran du
 * feu de camp lui-même (pas de PV affichés, pas de statut "+" sur les
 * cartes) : le soin se vérifie via `run-hero-hp` une fois revenu à la
 * carte (même valeur affichée qu'ailleurs), l'amélioration via une
 * relecture directe d'IndexedDB (`readSavedCurrentRun`).
 */
function campfireCurrentRun(heroHp: number): Record<string, unknown> {
  return {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp,
    deck: [{ runCardId: "run-card-0", cardId: "carapace_de_granit", upgraded: false }],
    noisettes: 20,
    map: { actId: "acte_1", floorCount: 1, nodes: [{ id: "campfire0", floor: 0, type: "feu_de_camp", edges: [] }] },
    currentNodeId: "campfire0",
    visitedNodeIds: ["campfire0"],
    phase: "feu_de_camp",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: null,
    pendingShop: null,
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

test("se reposer au feu de camp soigne le héros de 30% des PV manquants et ramène à la carte", async ({ page }) => {
  await page.goto("/");
  // PV manquants 70 (80 max - 10) -> soin floor(70*0.3) = 21 -> 31/80.
  await seedSaveFile(page, { currentRun: campfireCurrentRun(10) });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await page.getByTestId("campfire-heal").click();

  await expect(page.getByTestId("run-hero-hp")).toHaveText("PV 31/80");
});

test("améliorer une carte au feu de camp la marque améliorée et ramène à la carte", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, { currentRun: campfireCurrentRun(80) });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();

  await expect(page.getByTestId("campfire-upgrade-confirm")).toBeDisabled();
  await page.getByTestId("campfire-select-run-card-0").click();
  await page.getByTestId("campfire-upgrade-confirm").click();

  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
  const savedRun = await readSavedCurrentRun(page);
  const deck = savedRun?.deck as ReadonlyArray<{ runCardId: string; upgraded: boolean }> | undefined;
  expect(deck?.find((e) => e.runCardId === "run-card-0")?.upgraded).toBe(true);
});
