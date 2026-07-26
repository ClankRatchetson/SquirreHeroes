import { describe, expect, it } from "vitest";
import { combatReducer, createCombat } from "../../../src/engine/core";
import { makeCard, makeEnemy, makeState } from "../helpers";
import type { Card, EnemyDefinition, HeroDefinition } from "../../../src/engine/types";

describe("combatReducer", () => {
  it("no-op si le combat est déjà terminé", () => {
    const state = makeState({ phase: "combat_over", outcome: "victoire" });
    expect(combatReducer(state, { type: "END_TURN" })).toEqual(state);
    expect(combatReducer(state, { type: "PLAY_CARD", cardInstanceId: "x" })).toEqual(state);
  });

  it("PLAY_CARD délègue à resolvePlayCard", () => {
    const strike = makeCard({ id: "strike", cost: 1, effects: [{ kind: "damage", target: "enemy", amount: 10 }] });
    const state = makeState({
      cardCatalog: { strike },
      hand: [{ instanceId: "i1", cardId: "strike", upgraded: false }],
      energy: 3,
      enemies: [makeEnemy({ instanceId: "only", hp: 30 })],
    });
    const next = combatReducer(state, { type: "PLAY_CARD", cardInstanceId: "i1", targetEnemyId: "only" });
    expect(next.enemies[0]?.hp).toBe(20);
  });

  it("END_TURN délègue à resolveEndTurn", () => {
    const state = makeState({ hand: [], drawPile: [] });
    const next = combatReducer(state, { type: "END_TURN" });
    expect(next.turnNumber).toBe(state.turnNumber + 1);
  });

  it("joue un combat complet de bout en bout de façon déterministe (intégration)", () => {
    const strike: Card = makeCard({ id: "strike", cost: 1, effects: [{ kind: "damage", target: "enemy", amount: 6 }] });
    const catalog: Readonly<Record<string, Card>> = { strike };
    const hero: HeroDefinition = {
      id: "casse_noix",
      nameKey: "test.hero",
      maxHp: 40,
      startingDeck: Array.from({ length: 10 }, () => "strike"),
    };
    const enemyDef: EnemyDefinition = {
      id: "dummy",
      nameKey: "test.enemy",
      maxHp: 12,
      moves: [{ id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 4 }] }],
      pattern: ["hit"],
    };

    function runToCompletion(seed: number): string {
      let state = createCombat({ hero, enemies: [enemyDef], cardCatalog: catalog, seed });
      let iterations = 0;
      while (state.outcome === "en_cours" && iterations < 100) {
        const playableCard = state.hand[0];
        const action = playableCard
          ? ({ type: "PLAY_CARD", cardInstanceId: playableCard.instanceId, targetEnemyId: "dummy-0" } as const)
          : ({ type: "END_TURN" } as const);
        state = combatReducer(state, action);
        iterations += 1;
      }
      return state.outcome;
    }

    const first = runToCompletion(2024);
    const second = runToCompletion(2024);
    expect(first).toBe(second);
    expect(first).not.toBe("en_cours");
  });
});
