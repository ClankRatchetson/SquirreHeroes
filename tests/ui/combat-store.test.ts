import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCombatStore } from "../../src/ui/store/combat-store";
import { makeCard, makeState } from "../engine/helpers";
import type { CardInstance } from "../../src/engine/types";

const EMPTY_TARGETING = { selectedCardInstanceId: null, hoveredEnemyInstanceId: null };

describe("useCombatStore", () => {
  beforeEach(() => {
    useCombatStore.getState().startNewCombat(1);
  });

  it("startNewCombat initialise l'état via createCombat", () => {
    const state = useCombatStore.getState();
    expect(state.engineState).not.toBeNull();
    expect(state.engineState?.enemies).toHaveLength(3);
    expect(state.engineState?.hand).toHaveLength(5);
    expect(state.targeting).toEqual(EMPTY_TARGETING);
    expect(state.pendingEvents).toEqual([]);
    expect(state.isResolvingEnemyTurn).toBe(false);
  });

  it("playCard illégale est un no-op (référence engineState inchangée)", () => {
    const before = useCombatStore.getState().engineState;
    useCombatStore.getState().playCard("id-inexistant");
    const after = useCombatStore.getState();
    expect(after.engineState).toBe(before);
    expect(after.pendingEvents).toEqual([]);
  });

  it("playCard légale met à jour engineState et peuple pendingEvents", () => {
    const blockCard = makeCard({
      id: "test_block",
      type: "defense",
      cost: 1,
      effects: [{ kind: "block", target: "self", amount: 8 }],
    });
    const instance: CardInstance = { instanceId: "hand-1", cardId: "test_block", upgraded: false };
    const fixture = makeState({
      hand: [instance],
      cardCatalog: { test_block: blockCard },
      energy: 3,
    });
    useCombatStore.setState({ engineState: fixture, pendingEvents: [], targeting: EMPTY_TARGETING });

    useCombatStore.getState().playCard("hand-1");

    const after = useCombatStore.getState();
    expect(after.engineState).not.toBe(fixture);
    expect(after.engineState?.hero.block).toBe(8);
    expect(after.pendingEvents).toHaveLength(1);
    expect(after.pendingEvents[0]).toMatchObject({ kind: "block", targetId: "hero", amount: 8 });
    expect(after.targeting).toEqual(EMPTY_TARGETING);
  });

  it("endTurn ne boucle pas indéfiniment : la séquence de présentation se termine", () => {
    vi.useFakeTimers();
    try {
      useCombatStore.getState().endTurn();
      expect(useCombatStore.getState().isResolvingEnemyTurn).toBe(true);
      vi.runAllTimers();
      expect(useCombatStore.getState().isResolvingEnemyTurn).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("endTurn sur un combat déjà terminé reste un no-op sûr", () => {
    const finished = makeState({ phase: "combat_over", outcome: "victoire" });
    useCombatStore.setState({ engineState: finished });

    useCombatStore.getState().endTurn();

    expect(useCombatStore.getState().engineState).toBe(finished);
    expect(useCombatStore.getState().isResolvingEnemyTurn).toBe(false);
  });
});
