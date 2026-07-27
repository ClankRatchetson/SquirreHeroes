import { describe, expect, it } from "vitest";
import { aggregateBatch, buildGlandsDorCapCheck, MIN_SAMPLE_SIZE } from "../../src/sim/aggregate";
import type { SimRunRecord } from "../../src/sim/types";

function makeRecord(overrides: Partial<SimRunRecord> = {}): SimRunRecord {
  return {
    heroId: "casse_noix",
    victory: false,
    cardOffers: [],
    finalDeckCardIds: [],
    ...overrides,
  };
}

describe("aggregateBatch", () => {
  it("calcule le taux de victoire global et par héros", () => {
    const records = [makeRecord({ victory: true }), makeRecord({ victory: false }), makeRecord({ victory: true })];
    const result = aggregateBatch(records, []);
    expect(result.runsPlayed).toBe(3);
    expect(result.victories).toBe(2);
    expect(result.winRate).toBeCloseTo(2 / 3);
    expect(result.byHero).toEqual([{ heroId: "casse_noix", runsPlayed: 3, victories: 2, winRate: 2 / 3 }]);
  });

  it("byFamiliar est toujours vide (Phase 7 pas encore livrée)", () => {
    expect(aggregateBatch([], []).byFamiliar).toEqual([]);
  });

  it("calcule pickRate/winRateWhenPresent par carte", () => {
    const records = [
      makeRecord({ victory: true, cardOffers: [{ cardId: "a", chosen: true }], finalDeckCardIds: ["a"] }),
      makeRecord({ victory: false, cardOffers: [{ cardId: "a", chosen: false }], finalDeckCardIds: [] }),
    ];
    const [cardA] = aggregateBatch(records, ["a"]).byCard;
    expect(cardA).toEqual({
      cardId: "a",
      timesOffered: 2,
      timesChosen: 1,
      pickRate: 0.5,
      runsWithCardInFinalDeck: 1,
      winsWithCardInFinalDeck: 1,
      winRateWhenPresent: 1,
    });
  });

  it("une carte jamais offerte apparaît quand même avec des zéros (pas d'absence silencieuse)", () => {
    const [card] = aggregateBatch([makeRecord()], ["never_offered"]).byCard;
    expect(card).toEqual({
      cardId: "never_offered",
      timesOffered: 0,
      timesChosen: 0,
      pickRate: 0,
      runsWithCardInFinalDeck: 0,
      winsWithCardInFinalDeck: 0,
      winRateWhenPresent: 0,
    });
  });

  it("flags.underPicked/overPicked sur les seuils de pickRate", () => {
    const records = Array.from({ length: 100 }, (_, i) =>
      makeRecord({
        cardOffers: [
          { cardId: "rare_pick", chosen: i < 2 },
          { cardId: "always_pick", chosen: true },
        ],
      }),
    );
    const { flags } = aggregateBatch(records, ["rare_pick", "always_pick"]);
    expect(flags.underPicked).toContain("rare_pick"); // pickRate 2% < 5%
    expect(flags.overPicked).toContain("always_pick"); // pickRate 100% > 90%
    expect(flags.underPicked).not.toContain("always_pick");
    expect(flags.overPicked).not.toContain("rare_pick");
  });

  it("flags.dominant exige à la fois un échantillon minimal ET un écart de taux de victoire", () => {
    // Écart net (100% de victoire quand présente vs. ~22% global) mais échantillon sous MIN_SAMPLE_SIZE -> pas flaggé.
    const smallSample = [
      ...Array.from({ length: MIN_SAMPLE_SIZE - 1 }, () => makeRecord({ victory: true, finalDeckCardIds: ["op"] })),
      ...Array.from({ length: 100 }, () => makeRecord({ victory: false, finalDeckCardIds: [] })),
    ];
    expect(aggregateBatch(smallSample, ["op"]).flags.dominant).toEqual([]);

    // Même écart, échantillon suffisant -> flaggé.
    const bigSample = [
      ...Array.from({ length: MIN_SAMPLE_SIZE }, () => makeRecord({ victory: true, finalDeckCardIds: ["op"] })),
      ...Array.from({ length: 100 }, () => makeRecord({ victory: false, finalDeckCardIds: [] })),
    ];
    expect(aggregateBatch(bigSample, ["op"]).flags.dominant).toEqual(["op"]);
  });
});

describe("buildGlandsDorCapCheck", () => {
  it("calcule hpBonusPercent et winRateDeltaPoints", () => {
    const check = buildGlandsDorCapCheck({ heroMaxHp: 80, totalBonusMaxHp: 6, baselineWinRate: 0.1, fullyUpgradedWinRate: 0.15 });
    expect(check.hpBonusPercent).toBeCloseTo(7.5);
    expect(check.withinCap).toBe(true);
    expect(check.winRateDeltaPoints).toBeCloseTo(5);
  });

  it("withinCap passe à false si le bonus PV dépasse 20 %", () => {
    const check = buildGlandsDorCapCheck({ heroMaxHp: 80, totalBonusMaxHp: 20, baselineWinRate: 0, fullyUpgradedWinRate: 0 });
    expect(check.withinCap).toBe(false);
  });
});
