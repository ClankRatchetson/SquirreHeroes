import { describe, expect, it } from "vitest";
import { applyThorns } from "../../../src/engine/effects";
import { makeState } from "../helpers";

describe("applyThorns", () => {
  it("ne fait rien si le défenseur n'a pas Piquants", () => {
    const state = makeState();
    const next = applyThorns(state, "enemy-0", "hero");
    expect(next).toEqual(state);
  });

  it("inflige les dégâts de Piquants à l'attaquant en ignorant son blocage", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 100, statuses: [], retainsBlock: false },
      enemies: [
        {
          instanceId: "enemy-0",
          defId: "test",
          nameKey: "test",
          maxHp: 30,
          hp: 30,
          block: 0,
          statuses: [{ id: "piquants", stacks: 4 }],
          movesTaken: 0,
          intent: { id: "noop", nameKey: "noop", effects: [] },
          pattern: ["noop"],
          moves: {},
        },
      ],
    });
    const next = applyThorns(state, "enemy-0", "hero");
    expect(next.hero.hp).toBe(76); // 80 - 4, le blocage à 100 n'est pas consommé
    expect(next.hero.block).toBe(100);
  });

  it("peut retourner les dégâts vers un ennemi attaquant (héros porteur de Piquants)", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "piquants", stacks: 3 }], retainsBlock: false },
    });
    const next = applyThorns(state, "hero", "enemy-0");
    expect(next.enemies[0]?.hp).toBe(27);
  });
});
