import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRunStore } from "../../src/ui/store/run-store";
import { isCardPlayable } from "../../src/engine/core";

const EMPTY_TARGETING = { selectedCardInstanceId: null, hoveredEnemyInstanceId: null };

describe("useRunStore", () => {
  beforeEach(() => {
    useRunStore.getState().startNewRun(1);
  });

  it("startNewRun initialise l'état via createRun", () => {
    const state = useRunStore.getState();
    expect(state.runState).not.toBeNull();
    expect(state.runState?.phase).toBe("carte");
    expect(state.runState?.heroHp).toBe(state.runState?.heroMaxHp);
    expect(state.targeting).toEqual(EMPTY_TARGETING);
    expect(state.pendingEvents).toEqual([]);
    expect(state.isResolvingEnemyTurn).toBe(false);
  });

  it("dispatch d'une action illégale est un no-op (référence runState inchangée)", () => {
    const before = useRunStore.getState().runState;
    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId: "does-not-exist" });
    expect(useRunStore.getState().runState).toBe(before);
  });

  it("CHOISIR_NOEUD sur le nœud du floor 0 crée un pendingCombat et passe en phase combat", () => {
    const runState = useRunStore.getState().runState;
    const nodeId = runState?.map.nodes.find((n) => n.floor === 0)?.id;
    expect(nodeId).toBeDefined();
    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId: nodeId as string });
    const after = useRunStore.getState();
    expect(after.runState?.phase).toBe("combat");
    expect(after.runState?.pendingCombat).not.toBeNull();
  });

  it("playCard illégale (carte inexistante) est un no-op", () => {
    const runState = useRunStore.getState().runState;
    const nodeId = runState?.map.nodes.find((n) => n.floor === 0)?.id as string;
    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId });
    const before = useRunStore.getState().runState;

    useRunStore.getState().playCard("id-inexistant");

    expect(useRunStore.getState().runState).toBe(before);
  });

  it("playCard légale met à jour pendingCombat et peuple pendingEvents", () => {
    const runState = useRunStore.getState().runState;
    const nodeId = runState?.map.nodes.find((n) => n.floor === 0)?.id as string;
    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId });

    const combat = useRunStore.getState().runState?.pendingCombat;
    expect(combat).toBeDefined();
    const targetEnemyId = combat?.enemies.find((e) => e.hp > 0)?.instanceId;
    const playableInstance = combat?.hand.find((c) => isCardPlayable(combat, c.instanceId, targetEnemyId));
    expect(playableInstance).toBeDefined();

    useRunStore.getState().playCard(playableInstance?.instanceId as string, targetEnemyId);

    const after = useRunStore.getState();
    expect(after.runState?.pendingCombat).not.toBe(combat);
  });

  it("endTurn ne boucle pas indéfiniment : la séquence de présentation se termine", () => {
    vi.useFakeTimers();
    try {
      const runState = useRunStore.getState().runState;
      const nodeId = runState?.map.nodes.find((n) => n.floor === 0)?.id as string;
      useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId });

      useRunStore.getState().endTurn();
      expect(useRunStore.getState().isResolvingEnemyTurn).toBe(true);
      vi.runAllTimers();
      expect(useRunStore.getState().isResolvingEnemyTurn).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("endTurn hors combat est un no-op sûr", () => {
    const before = useRunStore.getState().runState;
    useRunStore.getState().endTurn();
    expect(useRunStore.getState().runState).toBe(before);
  });
});
