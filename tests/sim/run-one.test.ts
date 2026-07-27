import { describe, expect, it } from "vitest";
import { simulateOneRun } from "../../src/sim/run-one";
import { CARD_CATALOG } from "../../src/content/cards";
import { CASSE_NOIX } from "../../src/content/heroes";
import { ENEMY_CATALOG } from "../../src/content/enemies";
import { EVENT_CATALOG } from "../../src/content/events";

const BASE_PARAMS = {
  hero: CASSE_NOIX,
  cardCatalog: CARD_CATALOG,
  enemyCatalog: ENEMY_CATALOG,
  eventCatalog: EVENT_CATALOG,
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
};

describe("simulateOneRun", () => {
  it("atteint une issue terminale (victoire ou défaite)", () => {
    const record = simulateOneRun({ ...BASE_PARAMS, runSeed: 42, policySeed: 42 });
    expect(typeof record.victory).toBe("boolean");
    expect(record.heroId).toBe("casse_noix");
  });

  it("est déterministe : mêmes seeds -> même résultat", () => {
    const a = simulateOneRun({ ...BASE_PARAMS, runSeed: 7, policySeed: 99 });
    const b = simulateOneRun({ ...BASE_PARAMS, runSeed: 7, policySeed: 99 });
    expect(a).toEqual(b);
  });

  it("des seeds de politique différentes produisent des décisions différentes (même run seed)", () => {
    const results = Array.from({ length: 10 }, (_, i) => simulateOneRun({ ...BASE_PARAMS, runSeed: 1, policySeed: i }));
    const uniqueDeckSignatures = new Set(results.map((r) => r.finalDeckCardIds.join(",")));
    expect(uniqueDeckSignatures.size).toBeGreaterThan(1);
  });

  it("applique bonusMaxHp/upgradedStartingCardIds/noisettesBonusPerCombat sans planter", () => {
    const record = simulateOneRun({
      ...BASE_PARAMS,
      runSeed: 5,
      policySeed: 5,
      bonusMaxHp: 6,
      upgradedStartingCardIds: ["carapace_de_granit"],
      noisettesBonusPerCombat: 2,
    });
    expect(typeof record.victory).toBe("boolean");
  });

  it("chaque offre de carte référence un cardId réel du catalogue", () => {
    const record = simulateOneRun({ ...BASE_PARAMS, runSeed: 3, policySeed: 3 });
    for (const offer of record.cardOffers) {
      expect(CARD_CATALOG[offer.cardId]).toBeDefined();
    }
  });

  it("finalDeckCardIds ne contient que des cartes réelles et n'a pas de doublon", () => {
    const record = simulateOneRun({ ...BASE_PARAMS, runSeed: 11, policySeed: 11 });
    for (const cardId of record.finalDeckCardIds) {
      expect(CARD_CATALOG[cardId]).toBeDefined();
    }
    expect(new Set(record.finalDeckCardIds).size).toBe(record.finalDeckCardIds.length);
  });
});
