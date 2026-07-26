import { describe, expect, it } from "vitest";
import { getEnergy, getHandView, getVisibleEnemyIntents } from "../../../src/engine/core";
import { makeCard, makeEnemy, makeState } from "../helpers";

describe("getVisibleEnemyIntents", () => {
  it("ne retourne que les ennemis vivants, avec leur intention figée", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "alive", hp: 10 }), makeEnemy({ instanceId: "dead", hp: 0 })],
    });
    const intents = getVisibleEnemyIntents(state);
    expect(intents).toHaveLength(1);
    expect(intents[0]?.enemyInstanceId).toBe("alive");
  });
});

describe("getHandView", () => {
  it("joint chaque carte de la main à sa définition du catalogue", () => {
    const strike = makeCard({ id: "strike" });
    const state = makeState({
      cardCatalog: { strike },
      hand: [{ instanceId: "i1", cardId: "strike", upgraded: false }],
    });
    const view = getHandView(state);
    expect(view).toEqual([{ instance: state.hand[0], card: strike }]);
  });

  it("ignore silencieusement une instance dont la carte est absente du catalogue", () => {
    const state = makeState({
      cardCatalog: {},
      hand: [{ instanceId: "i1", cardId: "inconnue", upgraded: false }],
    });
    expect(getHandView(state)).toEqual([]);
  });
});

describe("getEnergy", () => {
  it("retourne l'énergie courante et le maximum", () => {
    const state = makeState({ energy: 1, maxEnergy: 3 });
    expect(getEnergy(state)).toEqual({ current: 1, max: 3 });
  });
});
