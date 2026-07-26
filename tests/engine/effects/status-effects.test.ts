import { describe, expect, it } from "vitest";
import { applyApplyStatusEffect, applyDoubleStatusEffect, applyRemoveStatusEffect } from "../../../src/engine/effects";
import { heroCtx, makeEnemy, makeState } from "../helpers";

describe("applyApplyStatusEffect", () => {
  it("ajoute un nouveau statut", () => {
    const state = makeState();
    const next = applyApplyStatusEffect(
      state,
      { kind: "applyStatus", target: "self", status: "force", stacks: 2 },
      heroCtx(),
    );
    expect(next.hero.statuses).toEqual([{ id: "force", stacks: 2 }]);
  });

  it("accumule les stacks sur un statut existant", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "force", stacks: 2 }], retainsBlock: false },
    });
    const next = applyApplyStatusEffect(
      state,
      { kind: "applyStatus", target: "self", status: "force", stacks: 3 },
      heroCtx(),
    );
    expect(next.hero.statuses).toEqual([{ id: "force", stacks: 5 }]);
  });

  it("s'applique à tous les ennemis vivants avec all_enemies", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a", hp: 10 }), makeEnemy({ instanceId: "b", hp: 10 })],
    });
    const next = applyApplyStatusEffect(
      state,
      { kind: "applyStatus", target: "all_enemies", status: "etourdi", stacks: 1 },
      heroCtx(),
    );
    expect(next.enemies.every((e) => e.statuses.some((s) => s.id === "etourdi"))).toBe(true);
  });
});

describe("applyRemoveStatusEffect", () => {
  it("retire entièrement le statut", () => {
    const state = makeState({
      hero: {
        maxHp: 80,
        hp: 80,
        block: 0,
        statuses: [
          { id: "a_decouvert", stacks: 3 },
          { id: "force", stacks: 1 },
        ],
        retainsBlock: false,
      },
    });
    const next = applyRemoveStatusEffect(
      state,
      { kind: "removeStatus", target: "self", status: "a_decouvert" },
      heroCtx(),
    );
    expect(next.hero.statuses).toEqual([{ id: "force", stacks: 1 }]);
  });

  it("ne fait rien si le statut est absent", () => {
    const state = makeState();
    const next = applyRemoveStatusEffect(
      state,
      { kind: "removeStatus", target: "self", status: "a_decouvert" },
      heroCtx(),
    );
    expect(next).toEqual(state);
  });
});

describe("applyDoubleStatusEffect", () => {
  it("double les stacks existantes", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "force", stacks: 3 }], retainsBlock: false },
    });
    const next = applyDoubleStatusEffect(state, { kind: "doubleStatus", target: "self", status: "force" }, heroCtx());
    expect(next.hero.statuses).toEqual([{ id: "force", stacks: 6 }]);
  });

  it("ne fait rien (0 x 2 = 0) si le statut est absent", () => {
    const state = makeState();
    const next = applyDoubleStatusEffect(state, { kind: "doubleStatus", target: "self", status: "force" }, heroCtx());
    expect(next.hero.statuses).toEqual([]);
  });
});
