import { describe, expect, it } from "vitest";
import { startHeroTurn } from "../../../src/engine/core";
import { makeEnemy, makeState } from "../helpers";
import type { CardInstance, EnemyMoveDef } from "../../../src/engine/types";

const cards: CardInstance[] = Array.from({ length: 6 }, (_, i) => ({
  instanceId: `c${String(i)}`,
  cardId: "filler",
  upgraded: false,
}));

const moveA: EnemyMoveDef = { id: "a", nameKey: "test.a", effects: [] };
const moveB: EnemyMoveDef = { id: "b", nameKey: "test.b", effects: [] };

describe("startHeroTurn", () => {
  it("réinitialise l'énergie et incrémente le tour", () => {
    const state = makeState({ energy: 0, maxEnergy: 3, turnNumber: 2, hand: [], drawPile: [] });
    const next = startHeroTurn(state);
    expect(next.energy).toBe(3);
    expect(next.turnNumber).toBe(3);
  });

  it("remet le blocage à 0 sauf si retainsBlock est vrai", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 10, statuses: [], retainsBlock: false },
    });
    expect(startHeroTurn(state).hero.block).toBe(0);

    const retaining = makeState({
      hero: { maxHp: 80, hp: 80, block: 10, statuses: [], retainsBlock: true },
    });
    expect(startHeroTurn(retaining).hero.block).toBe(10);
  });

  it("pioche jusqu'à atteindre la taille de main cible", () => {
    const state = makeState({ hand: [], drawPile: cards });
    const next = startHeroTurn(state);
    expect(next.hand).toHaveLength(5);
    expect(next.drawPile).toHaveLength(1);
  });

  it("fige une nouvelle intention pour chaque ennemi vivant, laisse les morts inchangés", () => {
    const state = makeState({
      enemies: [
        makeEnemy({
          instanceId: "alive",
          hp: 10,
          movesTaken: 1,
          pattern: ["a", "b"],
          moves: { a: moveA, b: moveB },
          intent: moveA,
        }),
        makeEnemy({ instanceId: "dead", hp: 0, intent: moveA }),
      ],
    });
    const next = startHeroTurn(state);
    expect(next.enemies.find((e) => e.instanceId === "alive")?.intent).toEqual(moveB);
    expect(next.enemies.find((e) => e.instanceId === "dead")?.intent).toEqual(moveA);
  });
});
