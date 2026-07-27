import { describe, expect, it } from "vitest";
import { hydrateRunState, stripRunState } from "../../src/persistence/serialize";
import { makeCard, makeRunState, makeState } from "../engine/helpers";
import type { Card } from "../../src/engine/types";

const strike: Card = makeCard({ id: "strike" });
const CATALOGS = {
  cardCatalog: { strike },
  enemyCatalog: {},
  eventCatalog: {},
};

describe("stripRunState", () => {
  it("retire les 3 catalogues de contenu et celui imbriqué dans pendingCombat", () => {
    const run = makeRunState({
      cardCatalog: CATALOGS.cardCatalog,
      enemyCatalog: CATALOGS.enemyCatalog,
      eventCatalog: CATALOGS.eventCatalog,
      pendingCombat: makeState({ cardCatalog: CATALOGS.cardCatalog }),
    });
    const stripped = stripRunState(run);
    expect(stripped).not.toHaveProperty("cardCatalog");
    expect(stripped).not.toHaveProperty("enemyCatalog");
    expect(stripped).not.toHaveProperty("eventCatalog");
    expect(stripped.pendingCombat).not.toBeNull();
    expect(stripped.pendingCombat).not.toHaveProperty("cardCatalog");
  });

  it("gère pendingCombat: null", () => {
    const run = makeRunState({ pendingCombat: null });
    expect(stripRunState(run).pendingCombat).toBeNull();
  });
});

describe("hydrateRunState", () => {
  it("restaure un RunState deep-equal à l'original, catalogues réinjectés par référence", () => {
    const run = makeRunState({
      cardCatalog: CATALOGS.cardCatalog,
      enemyCatalog: CATALOGS.enemyCatalog,
      eventCatalog: CATALOGS.eventCatalog,
      pendingCombat: makeState({ cardCatalog: CATALOGS.cardCatalog }),
    });
    const stripped = stripRunState(run);
    const hydrated = hydrateRunState(stripped, CATALOGS);

    expect(hydrated).toEqual(run);
    expect(hydrated.cardCatalog).toBe(CATALOGS.cardCatalog);
    expect(hydrated.enemyCatalog).toBe(CATALOGS.enemyCatalog);
    expect(hydrated.eventCatalog).toBe(CATALOGS.eventCatalog);
    expect(hydrated.pendingCombat?.cardCatalog).toBe(CATALOGS.cardCatalog);
  });

  it("gère pendingCombat: null", () => {
    const run = makeRunState({ pendingCombat: null });
    const hydrated = hydrateRunState(stripRunState(run), CATALOGS);
    expect(hydrated.pendingCombat).toBeNull();
  });

  it("familiarId/familiarPassive (run) et familiarPassive (combat) survivent au strip+hydrate", () => {
    const run = makeRunState({
      familiarId: "mesange_radar",
      familiarPassive: { kind: "bonusDrawFirstTurn", amount: 1 },
      pendingCombat: makeState({
        cardCatalog: CATALOGS.cardCatalog,
        familiarPassive: { kind: "bonusDrawFirstTurn", amount: 1 },
      }),
    });
    const hydrated = hydrateRunState(stripRunState(run), CATALOGS);
    expect(hydrated.familiarId).toBe("mesange_radar");
    expect(hydrated.familiarPassive).toEqual({ kind: "bonusDrawFirstTurn", amount: 1 });
    expect(hydrated.pendingCombat?.familiarPassive).toEqual({ kind: "bonusDrawFirstTurn", amount: 1 });
  });

  it("acts/actIndex/bossesDefeatedThisRun/pendingActTransition (multi-actes) survivent au strip+hydrate", () => {
    const actTwo = { actId: "acte_2", commonEnemyIds: ["a"], eliteEnemyIds: ["b"], bossEnemyIds: ["c"] };
    const run = makeRunState({
      acts: [{ actId: "acte_1", commonEnemyIds: ["mulot_masque"], eliteEnemyIds: ["merle_mercenaire"], bossEnemyIds: ["baronne_bec_de_fer"] }, actTwo],
      actIndex: 1,
      bossesDefeatedThisRun: ["baronne_bec_de_fer"],
      pendingActTransition: true,
    });
    const hydrated = hydrateRunState(stripRunState(run), CATALOGS);
    expect(hydrated.acts).toEqual(run.acts);
    expect(hydrated.actIndex).toBe(1);
    expect(hydrated.bossesDefeatedThisRun).toEqual(["baronne_bec_de_fer"]);
    expect(hydrated.pendingActTransition).toBe(true);
  });
});
