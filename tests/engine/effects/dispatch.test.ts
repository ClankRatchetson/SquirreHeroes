import { describe, expect, it } from "vitest";
import { resolveEffect, resolveEffects } from "../../../src/engine/effects";
import { heroCtx, makeEnemy, makeState } from "../helpers";
import type { EffectSpec } from "../../../src/engine/types";

describe("resolveEffect", () => {
  it("route chaque kind vers son handler", () => {
    const state = makeState();
    const next = resolveEffect(state, { kind: "gainEnergy", amount: 1 }, heroCtx());
    expect(next.energy).toBe(state.energy + 1);
  });
});

describe("resolveEffects", () => {
  it("applique les effets dans l'ordre, chacun voyant l'état modifié par le précédent", () => {
    const state = makeState({ energy: 1, hand: [], drawPile: [] });
    const effects: readonly EffectSpec[] = [
      { kind: "gainEnergy", amount: 2 },
      { kind: "gainEnergy", amount: 3 },
    ];
    const next = resolveEffects(state, effects, heroCtx());
    expect(next.energy).toBe(6);
  });

  it("un effet sans cible valide n'empêche pas les effets suivants de s'appliquer", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
      energy: 0,
    });
    const effects: readonly EffectSpec[] = [
      { kind: "damage", target: "enemy", amount: 10 }, // cible ambiguë -> no-op
      { kind: "gainEnergy", amount: 1 },
    ];
    const next = resolveEffects(state, effects, heroCtx());
    expect(next.energy).toBe(1);
    expect(next.enemies.map((e) => e.hp)).toEqual(state.enemies.map((e) => e.hp));
  });

  it("retourne l'état inchangé pour une liste d'effets vide", () => {
    const state = makeState();
    expect(resolveEffects(state, [], heroCtx())).toEqual(state);
  });
});
