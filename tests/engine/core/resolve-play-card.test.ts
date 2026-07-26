import { describe, expect, it } from "vitest";
import { isCardPlayable, resolvePlayCard } from "../../../src/engine/core";
import { makeCard, makeEnemy, makeState } from "../helpers";
import type { CardInstance } from "../../../src/engine/types";

const strike = makeCard({ id: "strike", cost: 2, type: "attaque", effects: [{ kind: "damage", target: "enemy", amount: 10 }] });
const curse = makeCard({ id: "curse", cost: 0, type: "malediction", effects: [] });
const exhaustCard = makeCard({
  id: "exhaust_card",
  cost: 1,
  effects: [{ kind: "damage", target: "enemy", amount: 5 }, { kind: "exhaust" }],
});

const CATALOG = { strike, curse, exhaust_card: exhaustCard };

const strikeInstance: CardInstance = { instanceId: "i1", cardId: "strike", upgraded: false };
const curseInstance: CardInstance = { instanceId: "i2", cardId: "curse", upgraded: false };
const exhaustInstance: CardInstance = { instanceId: "i3", cardId: "exhaust_card", upgraded: false };

describe("isCardPlayable", () => {
  it("false hors du tour héros", () => {
    const state = makeState({ hand: [strikeInstance], cardCatalog: CATALOG, phase: "combat_over" });
    expect(isCardPlayable(state, "i1")).toBe(false);
  });

  it("false si la carte n'est pas en main", () => {
    const state = makeState({ hand: [], cardCatalog: CATALOG });
    expect(isCardPlayable(state, "i1")).toBe(false);
  });

  it("false pour une malédiction", () => {
    const state = makeState({ hand: [curseInstance], cardCatalog: CATALOG, energy: 3 });
    expect(isCardPlayable(state, "i2")).toBe(false);
  });

  it("false si énergie insuffisante", () => {
    const state = makeState({ hand: [strikeInstance], cardCatalog: CATALOG, energy: 1 });
    expect(isCardPlayable(state, "i1")).toBe(false);
  });

  it("exige une cible explicite si plusieurs ennemis sont vivants", () => {
    const state = makeState({
      hand: [strikeInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
    });
    expect(isCardPlayable(state, "i1")).toBe(false);
    expect(isCardPlayable(state, "i1", "a")).toBe(true);
    expect(isCardPlayable(state, "i1", "inexistant")).toBe(false);
  });

  it("false si une carte d'attaque n'a plus aucun ennemi vivant à cibler", () => {
    const state = makeState({
      hand: [strikeInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "a", hp: 0 })],
    });
    expect(isCardPlayable(state, "i1")).toBe(false);
  });

  it("cible automatiquement l'unique ennemi vivant sans cible explicite", () => {
    const state = makeState({
      hand: [strikeInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "only" })],
    });
    expect(isCardPlayable(state, "i1")).toBe(true);
  });
});

describe("resolvePlayCard", () => {
  it("no-op si l'action est illégale", () => {
    const state = makeState({ hand: [curseInstance], cardCatalog: CATALOG, energy: 3 });
    const next = resolvePlayCard(state, { type: "PLAY_CARD", cardInstanceId: "i2" });
    expect(next).toEqual(state);
  });

  it("retire la carte de la main, décrémente l'énergie, applique les effets, défausse la carte", () => {
    const state = makeState({
      hand: [strikeInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "only", hp: 30 })],
    });
    const next = resolvePlayCard(state, { type: "PLAY_CARD", cardInstanceId: "i1", targetEnemyId: "only" });
    expect(next.hand).toEqual([]);
    expect(next.energy).toBe(1);
    expect(next.enemies[0]?.hp).toBe(20);
    expect(next.discardPile).toEqual([strikeInstance]);
    expect(next.exhaustPile).toEqual([]);
  });

  it("route vers exhaustPile plutôt que discardPile quand la carte a un effet exhaust", () => {
    const state = makeState({
      hand: [exhaustInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "only", hp: 30 })],
    });
    const next = resolvePlayCard(state, { type: "PLAY_CARD", cardInstanceId: "i3", targetEnemyId: "only" });
    expect(next.exhaustPile).toEqual([exhaustInstance]);
    expect(next.discardPile).toEqual([]);
  });

  it("déclenche la victoire si la carte achève tous les ennemis", () => {
    const state = makeState({
      hand: [strikeInstance],
      cardCatalog: CATALOG,
      energy: 3,
      enemies: [makeEnemy({ instanceId: "only", hp: 5 })],
    });
    const next = resolvePlayCard(state, { type: "PLAY_CARD", cardInstanceId: "i1", targetEnemyId: "only" });
    expect(next.outcome).toBe("victoire");
    expect(next.phase).toBe("combat_over");
  });
});
