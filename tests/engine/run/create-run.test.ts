import { describe, expect, it } from "vitest";
import { createRun } from "../../../src/engine/run/create-run";
import { makeCard } from "../helpers";
import type { Card, EnemyDefinition, EventDefinition, HeroDefinition } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike" });
const CATALOG: Readonly<Record<string, Card>> = { strike };

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

describe("createRun", () => {
  it("initialise PV/deck/Noisettes/phase correctement", () => {
    const state = createRun({
      hero,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      commonEnemyIds: ["dummy"],
      eliteEnemyIds: ["dummy"],
      bossEnemyIds: ["dummy"],
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
      commonEnemyIds: ["dummy"],
      eliteEnemyIds: ["dummy"],
      bossEnemyIds: ["dummy"],
      seed: 99,
    };
    expect(createRun(params)).toEqual(createRun(params));
  });
});
