import { describe, expect, it } from "vitest";
import { createRun } from "../../../src/engine/run/create-run";
import { makeCard } from "../helpers";
import type {
  Card,
  EnemyDefinition,
  EventDefinition,
  FamiliarDefinition,
  HeroDefinition,
  RunActConfig,
} from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike" });
const familiarCard: Card = makeCard({ id: "familiar_signature", hero: "mesange_radar" });
const CATALOG: Readonly<Record<string, Card>> = { strike, familiar_signature: familiarCard };

const familiar: FamiliarDefinition = {
  id: "mesange_radar",
  nameKey: "test.familiar",
  passive: { kind: "bonusDrawFirstTurn", amount: 1 },
  signatureCardId: "familiar_signature",
};

const hero: HeroDefinition = {
  id: "casse_noix",
  nameKey: "test.hero",
  maxHp: 80,
  startingDeck: ["strike", "strike"],
};

const dummy: EnemyDefinition = {
  id: "dummy",
  nameKey: "test.enemy",
  maxHp: 20,
  moves: [{ id: "hit", nameKey: "test.hit", effects: [] }],
  pattern: ["hit"],
};
const ENEMY_CATALOG: Readonly<Record<string, EnemyDefinition>> = { dummy };

const anEvent: EventDefinition = {
  id: "an_event",
  titleKey: "test.event.title",
  textKey: "test.event.text",
  choices: [
    { id: "a", labelKey: "test.event.choices.a.label", effects: [] },
    { id: "b", labelKey: "test.event.choices.b.label", effects: [] },
  ],
};
const EVENT_CATALOG: Readonly<Record<string, EventDefinition>> = { an_event: anEvent };

const actOne: RunActConfig = {
  actId: "acte_1",
  commonEnemyIds: ["dummy"],
  eliteEnemyIds: ["dummy"],
  bossEnemyIds: ["dummy"],
};
const actTwo: RunActConfig = {
  actId: "acte_2",
  commonEnemyIds: ["dummy"],
  eliteEnemyIds: ["dummy"],
  bossEnemyIds: ["dummy"],
};

describe("createRun", () => {
  it("initialise PV/deck/Noisettes/phase correctement", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
    });
    expect(state.heroHp).toBe(80);
    expect(state.heroMaxHp).toBe(80);
    expect(state.noisettes).toBe(0);
    expect(state.deck).toHaveLength(2);
    expect(state.phase).toBe("carte");
    expect(state.outcome).toBe("en_cours");
    expect(state.currentNodeId).toBeNull();
  });

  it("est déterministe : la même seed produit le même run initial", () => {
    const params = {
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 99,
    };
    expect(createRun(params)).toEqual(createRun(params));
  });

  it("sans les 3 bonus optionnels, le comportement est identique à avant la Phase 5 (non-régression)", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
    });
    expect(state.heroMaxHp).toBe(hero.maxHp);
    expect(state.heroHp).toBe(hero.maxHp);
    expect(state.noisettesBonusPerCombat).toBe(0);
    expect(state.deck.every((entry) => !entry.upgraded)).toBe(true);
  });

  it("bonusMaxHp s'ajoute à heroMaxHp et heroHp", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
      bonusMaxHp: 5,
    });
    expect(state.heroMaxHp).toBe(85);
    expect(state.heroHp).toBe(85);
  });

  it("upgradedStartingCardIds marque les entrées de deck correspondantes comme améliorées", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
      upgradedStartingCardIds: ["strike"],
    });
    expect(state.deck).toHaveLength(2);
    expect(state.deck.every((entry) => entry.upgraded)).toBe(true);
  });

  it("noisettesBonusPerCombat est reporté tel quel dans le RunState", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
      noisettesBonusPerCombat: 2,
    });
    expect(state.noisettesBonusPerCombat).toBe(2);
  });

  it("sans familier, familiarId/familiarPassive valent null et le deck n'a que les cartes du héros", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
    });
    expect(state.familiarId).toBeNull();
    expect(state.familiarPassive).toBeNull();
    expect(state.deck).toHaveLength(2);
  });

  it("avec un familier, sa carte signature s'ajoute au deck et familiarId/familiarPassive sont figés", () => {
    const state = createRun({
      hero,
      familiar,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne],
      seed: 1,
    });
    expect(state.familiarId).toBe("mesange_radar");
    expect(state.familiarPassive).toEqual({ kind: "bonusDrawFirstTurn", amount: 1 });
    expect(state.deck).toHaveLength(3);
    expect(state.deck.filter((entry) => entry.cardId === "familiar_signature")).toHaveLength(1);
  });

  it("génère la carte du 1er acte seulement, figeant acts/actIndex/bossesDefeatedThisRun/pendingActTransition", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: [actOne, actTwo],
      seed: 1,
    });
    expect(state.map.actId).toBe("acte_1");
    expect(state.acts).toEqual([actOne, actTwo]);
    expect(state.actIndex).toBe(0);
    expect(state.bossesDefeatedThisRun).toEqual([]);
    expect(state.pendingActTransition).toBe(false);
  });

  it("lève si acts est vide (contenu manquant)", () => {
    expect(() =>
      createRun({
        hero,
        cardCatalog: CATALOG,
        enemyCatalog: ENEMY_CATALOG,
        eventCatalog: EVENT_CATALOG,
        acts: [],
        seed: 1,
      }),
    ).toThrow();
  });
});
