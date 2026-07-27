import { describe, expect, it } from "vitest";
import { runSimulation } from "../../src/sim/report";
import { CARD_CATALOG } from "../../src/content/cards";
import { CASSE_NOIX } from "../../src/content/heroes";
import { ENEMY_CATALOG } from "../../src/content/enemies";
import { EVENT_CATALOG } from "../../src/content/events";
import { META_TREE } from "../../src/content/meta-tree";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { RUN_ACTS } from "../../src/content/acts";

/**
 * Test d'intégration léger du harnais complet — appelle directement
 * `runSimulation` avec un petit N (pas via `tsx`/`child_process`, qui
 * déclencherait l'écriture de fichier et `process.exit` du vrai CLI).
 */
const CONFIG = {
  hero: CASSE_NOIX,
  cardCatalog: CARD_CATALOG,
  enemyCatalog: ENEMY_CATALOG,
  eventCatalog: EVENT_CATALOG,
  acts: RUN_ACTS,
  cardIds: Object.keys(CARD_CATALOG),
  metaTree: META_TREE,
  initialMetaProgression: INITIAL_META_PROGRESSION,
};

describe("runSimulation", () => {
  it("produit un BalanceReport dont la forme respecte tous les invariants", () => {
    const report = runSimulation({ ...CONFIG, runs: 20, seed: 1 });

    expect(report.config.runs).toBe(20);
    expect(report.config.seed).toBe(1);

    for (const batch of [report.baseline, report.fullyUpgraded]) {
      expect(batch.runsPlayed).toBe(10); // 20 runs / 2 lots
      expect(batch.winRate).toBeGreaterThanOrEqual(0);
      expect(batch.winRate).toBeLessThanOrEqual(1);
      // `runSimulation` est mono-héros par construction (`createRun`/`createCombat` prennent un seul
      // héros) — même avec 2 héros dans `HERO_CATALOG`, un appel donné ne simule que `CONFIG.hero`.
      expect(batch.byHero).toHaveLength(1);
      expect(batch.byFamiliar).toEqual([]);
      expect(batch.byCard).toHaveLength(Object.keys(CARD_CATALOG).length);
      for (const card of batch.byCard) {
        expect(card.pickRate).toBeGreaterThanOrEqual(0);
        expect(card.pickRate).toBeLessThanOrEqual(1);
        expect(card.winRateWhenPresent).toBeGreaterThanOrEqual(0);
        expect(card.winRateWhenPresent).toBeLessThanOrEqual(1);
        expect(card.timesChosen).toBeLessThanOrEqual(card.timesOffered);
        expect(card.winsWithCardInFinalDeck).toBeLessThanOrEqual(card.runsWithCardInFinalDeck);
      }
    }

    expect(report.glandsDorCapCheck.hpBonusPercent).toBeGreaterThan(0);
    expect(typeof report.glandsDorCapCheck.withinCap).toBe("boolean");
  });

  it("un nombre de runs impair est arrondi au nombre pair inférieur (2 lots égaux)", () => {
    const report = runSimulation({ ...CONFIG, runs: 21, seed: 2 });
    expect(report.config.runs).toBe(20);
  });

  it("est déterministe : même config -> même rapport", () => {
    const a = runSimulation({ ...CONFIG, runs: 10, seed: 3 });
    const b = runSimulation({ ...CONFIG, runs: 10, seed: 3 });
    expect(a).toEqual(b);
  });
});
