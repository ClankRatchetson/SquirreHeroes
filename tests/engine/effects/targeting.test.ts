import { describe, expect, it } from "vitest";
import { resolveTargets } from "../../../src/engine/effects";
import { enemyCtx, heroCtx, makeEnemy, makeState } from "../helpers";

describe("resolveTargets — le héros agit", () => {
  it("self résout vers le héros", () => {
    const state = makeState();
    expect(resolveTargets(state, "self", heroCtx())).toEqual(["hero"]);
  });

  it("enemy résout automatiquement vers l'unique ennemi vivant", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "only" })] });
    expect(resolveTargets(state, "enemy", heroCtx())).toEqual(["only"]);
  });

  it("enemy utilise chosenEnemyId quand plusieurs ennemis sont vivants", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
    });
    expect(resolveTargets(state, "enemy", heroCtx({ chosenEnemyId: "b" }))).toEqual(["b"]);
  });

  it("enemy renvoie une liste vide si plusieurs vivants et aucune cible choisie", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
    });
    expect(resolveTargets(state, "enemy", heroCtx())).toEqual([]);
  });

  it("all_enemies ne renvoie que les ennemis vivants", () => {
    const state = makeState({
      enemies: [
        makeEnemy({ instanceId: "alive-1", hp: 10 }),
        makeEnemy({ instanceId: "dead", hp: 0 }),
        makeEnemy({ instanceId: "alive-2", hp: 5 }),
      ],
    });
    expect(resolveTargets(state, "all_enemies", heroCtx())).toEqual(["alive-1", "alive-2"]);
  });
});

describe("resolveTargets — un ennemi agit", () => {
  it("self résout vers l'ennemi lui-même", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "enemy-0" })] });
    expect(resolveTargets(state, "self", enemyCtx("enemy-0"))).toEqual(["enemy-0"]);
  });

  it("enemy et all_enemies résolvent tous deux vers le héros", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "enemy-0" })] });
    expect(resolveTargets(state, "enemy", enemyCtx("enemy-0"))).toEqual(["hero"]);
    expect(resolveTargets(state, "all_enemies", enemyCtx("enemy-0"))).toEqual(["hero"]);
  });
});
