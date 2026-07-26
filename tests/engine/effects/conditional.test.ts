import { describe, expect, it } from "vitest";
import { applyConditionalEffect } from "../../../src/engine/effects";
import { heroCtx, makeEnemy, makeState } from "../helpers";

describe("applyConditionalEffect", () => {
  it("résout whenTrue si le statut est présent sur la cible", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "e", hp: 30, statuses: [{ id: "a_decouvert", stacks: 1 }] })] });
    const next = applyConditionalEffect(
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
    // La cible a aussi À découvert au moment où le dégât nommé se résout :
    // 15 * 1.5 = 22.5 -> arrondi à 23 (le statut s'applique aussi à ce
    // dégât conditionnel, pas seulement à la vérification de branche).
    expect(next.enemies[0]?.hp).toBe(7);
  });

  it("résout whenFalse si le statut est absent", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "e", hp: 30 })] });
    const next = applyConditionalEffect(
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
    expect(next.enemies[0]?.hp).toBe(21);
  });

  it("résout whenFalse si aucune cible ne se résout", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
    });
    const next = applyConditionalEffect(
      state,
      {
        kind: "conditional",
        target: "enemy",
        status: "a_decouvert",
        whenTrue: [{ kind: "gainEnergy", amount: 99 }],
        whenFalse: [{ kind: "gainEnergy", amount: 1 }],
      },
      heroCtx(),
    );
    expect(next.energy).toBe(state.energy + 1);
  });
});
