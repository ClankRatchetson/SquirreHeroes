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

  /**
   * Garde-fou de non-régression : `conditional.ts` importe `resolveEffects`
   * depuis ce module (import circulaire nécessaire), et `dispatch.test.ts`
   * n'exerçait jusqu'ici `conditional` que via un appel direct à
   * `applyConditionalEffect` (cf. `conditional.test.ts`), jamais via
   * `resolveEffect`/le registre de handlers. Un registre construit en
   * constante de module (plutôt que paresseusement) capturerait
   * `applyConditionalEffect` à `undefined` selon l'ordre d'évaluation du
   * graphe de modules — bug réel révélé par le harnais de simulation
   * (Phase 6) important le moteur depuis un nouveau point d'entrée.
   */
  it("route \"conditional\" vers son handler (régression import circulaire avec conditional.ts)", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "e", hp: 30, statuses: [{ id: "a_decouvert", stacks: 1 }] })] });
    const next = resolveEffect(
      state,
      {
        kind: "conditional",
        target: "enemy",
        status: "a_decouvert",
        whenTrue: [{ kind: "damage", target: "enemy", amount: 15 }],
        whenFalse: [{ kind: "damage", target: "enemy", amount: 9 }],
      },
      heroCtx(),
    );
    expect(next.enemies[0]?.hp).toBeLessThan(30);
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
