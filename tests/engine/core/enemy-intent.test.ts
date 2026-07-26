import { describe, expect, it } from "vitest";
import { decideNextIntent } from "../../../src/engine/core";
import { createRng } from "../../../src/engine/rng";
import { makeEnemy } from "../helpers";
import type { EnemyMoveDef } from "../../../src/engine/types";

const moveA: EnemyMoveDef = { id: "a", nameKey: "test.a", effects: [] };
const moveB: EnemyMoveDef = { id: "b", nameKey: "test.b", effects: [] };
const moveC: EnemyMoveDef = { id: "c", nameKey: "test.c", effects: [] };

describe("decideNextIntent", () => {
  it("suit le pattern cyclique selon movesTaken", () => {
    const enemy = makeEnemy({
      pattern: ["a", "b", "c"],
      moves: { a: moveA, b: moveB, c: moveC },
    });
    const expectations: readonly [number, EnemyMoveDef][] = [
      [0, moveA],
      [1, moveB],
      [2, moveC],
      [3, moveA],
      [4, moveB],
    ];
    for (const [movesTaken, expected] of expectations) {
      const [intent] = decideNextIntent({ ...enemy, movesTaken }, createRng(1));
      expect(intent).toEqual(expected);
    }
  });

  it("ne consomme pas le PRNG (Phase 1 est purement cyclique)", () => {
    const enemy = makeEnemy({ pattern: ["a"], moves: { a: moveA } });
    const rng = createRng(7);
    const [, nextRng] = decideNextIntent(enemy, rng);
    expect(nextRng).toEqual(rng);
  });

  it("retombe sur l'intention courante si le contenu est incohérent (défensif)", () => {
    const enemy = makeEnemy({ pattern: ["inconnu"], moves: {}, intent: moveB });
    const [intent] = decideNextIntent(enemy, createRng(1));
    expect(intent).toEqual(moveB);
  });
});
