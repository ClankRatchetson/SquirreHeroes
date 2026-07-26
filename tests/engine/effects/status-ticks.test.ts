import { describe, expect, it } from "vitest";
import { tickEndOfTurnStatuses } from "../../../src/engine/effects";
import { makeState } from "../helpers";

describe("tickEndOfTurnStatuses", () => {
  it("inflige les dégâts de Sève empoisonnée puis décrémente", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 5, statuses: [{ id: "seve_empoisonnee", stacks: 4 }], retainsBlock: false },
    });
    const next = tickEndOfTurnStatuses(state, "hero");
    expect(next.hero.hp).toBe(76);
    expect(next.hero.block).toBe(5); // ignore le blocage
    expect(next.hero.statuses).toEqual([{ id: "seve_empoisonnee", stacks: 3 }]);
  });

  it("retire Sève empoisonnée quand elle tombe à 0", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "seve_empoisonnee", stacks: 1 }], retainsBlock: false },
    });
    const next = tickEndOfTurnStatuses(state, "hero");
    expect(next.hero.statuses).toEqual([]);
  });

  it("soigne via Repousse puis décrémente, plafonné au max de PV", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 78, block: 0, statuses: [{ id: "repousse", stacks: 5 }], retainsBlock: false },
    });
    const next = tickEndOfTurnStatuses(state, "hero");
    expect(next.hero.hp).toBe(80);
    expect(next.hero.statuses).toEqual([{ id: "repousse", stacks: 4 }]);
  });

  it("applique Sève empoisonnée puis Repousse dans le même tick", () => {
    const state = makeState({
      hero: {
        maxHp: 80,
        hp: 50,
        block: 0,
        statuses: [
          { id: "seve_empoisonnee", stacks: 2 },
          { id: "repousse", stacks: 3 },
        ],
        retainsBlock: false,
      },
    });
    const next = tickEndOfTurnStatuses(state, "hero");
    expect(next.hero.hp).toBe(51); // 50 - 2 + 3
  });

  it("ne fait rien si ni Sève empoisonnée ni Repousse ne sont présents", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "force", stacks: 2 }], retainsBlock: false },
    });
    const next = tickEndOfTurnStatuses(state, "hero");
    expect(next).toEqual(state);
  });

  it("fonctionne sur un ennemi comme porteur", () => {
    const state = makeState({
      enemies: [
        {
          instanceId: "enemy-0",
          defId: "test",
          nameKey: "test",
          maxHp: 30,
          hp: 30,
          block: 0,
          statuses: [{ id: "seve_empoisonnee", stacks: 5 }],
          movesTaken: 0,
          intent: { id: "noop", nameKey: "noop", effects: [] },
          pattern: ["noop"],
          moves: { noop: { id: "noop", nameKey: "noop", effects: [] } },
        },
      ],
    });
    const next = tickEndOfTurnStatuses(state, "enemy-0");
    expect(next.enemies[0]?.hp).toBe(25);
  });
});
