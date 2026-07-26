import { describe, expect, it } from "vitest";
import { checkCombatOutcome } from "../../../src/engine/core";
import { makeEnemy, makeState } from "../helpers";

describe("checkCombatOutcome", () => {
  it("passe en défaite quand le héros est à 0 PV", () => {
    const state = makeState({ hero: { maxHp: 80, hp: 0, block: 0, statuses: [], retainsBlock: false } });
    const next = checkCombatOutcome(state);
    expect(next.outcome).toBe("defaite");
    expect(next.phase).toBe("combat_over");
  });

  it("passe en victoire quand tous les ennemis sont à 0 PV", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a", hp: 0 }), makeEnemy({ instanceId: "b", hp: 0 })],
    });
    const next = checkCombatOutcome(state);
    expect(next.outcome).toBe("victoire");
    expect(next.phase).toBe("combat_over");
  });

  it("reste en_cours si le héros et au moins un ennemi sont vivants", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a", hp: 0 }), makeEnemy({ instanceId: "b", hp: 5 })],
    });
    expect(checkCombatOutcome(state)).toEqual(state);
  });

  it("ne déclare pas victoire par vacuité si la liste d'ennemis est vide", () => {
    const state = makeState({ enemies: [] });
    expect(checkCombatOutcome(state).outcome).toBe("en_cours");
  });
});
