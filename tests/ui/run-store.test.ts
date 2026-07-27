import { beforeEach, describe, expect, it, vi } from "vitest";
import { isCardPlayable } from "../../src/engine/core";
import { CARD_CATALOG } from "../../src/content/cards";
import { ENEMY_CATALOG } from "../../src/content/enemies";
import { EVENT_CATALOG } from "../../src/content/events";
import { stripRunState } from "../../src/persistence/serialize";

const { fakeAdapter } = vi.hoisted(() => {
  let stored: unknown;
  return {
    fakeAdapter: {
      load: vi.fn(() => Promise.resolve(stored)),
      save: vi.fn((data: unknown) => {
        stored = data;
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        stored = undefined;
        return Promise.resolve();
      }),
    },
  };
});

vi.mock("../../src/ui/persistence/storage", () => ({ storageAdapter: fakeAdapter }));

const { useRunStore } = await import("../../src/ui/store/run-store");

const EMPTY_TARGETING = { selectedCardInstanceId: null, hoveredEnemyInstanceId: null };

describe("useRunStore", () => {
  beforeEach(() => {
    fakeAdapter.load.mockClear();
    fakeAdapter.save.mockClear();
    fakeAdapter.clear.mockClear();
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

  it("startNewRun persiste immédiatement", () => {
    const runState = useRunStore.getState().runState;
    expect(runState).not.toBeNull();
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { currentRun: unknown };
    expect(saved.currentRun).toEqual(stripRunState(runState as NonNullable<typeof runState>));
  });

  it("un dispatch qui change runState déclenche une sauvegarde", () => {
    const nodeId = useRunStore.getState().runState?.map.nodes.find((n) => n.floor === 0)?.id as string;
    fakeAdapter.save.mockClear();

    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId });

    const runState = useRunStore.getState().runState;
    expect(runState).not.toBeNull();
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { currentRun: unknown };
    expect(saved.currentRun).toEqual(stripRunState(runState as NonNullable<typeof runState>));
  });

  it("un dispatch no-op ne déclenche aucune sauvegarde", () => {
    fakeAdapter.save.mockClear();
    useRunStore.getState().dispatch({ type: "CHOISIR_NOEUD", nodeId: "does-not-exist" });
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });

  it("hydrateRun réattache les catalogues vivants et réinitialise l'état UI éphémère", () => {
    const original = useRunStore.getState().runState;
    expect(original).not.toBeNull();
    const persisted = stripRunState(original as NonNullable<typeof original>);
    useRunStore.setState({
      targeting: { selectedCardInstanceId: "x", hoveredEnemyInstanceId: "y" },
      pendingEvents: [{ id: "e1", kind: "damage", targetId: "hero", amount: 5 }],
      isResolvingEnemyTurn: true,
    });

    useRunStore.getState().hydrateRun(persisted);

    const after = useRunStore.getState();
    expect(after.runState?.cardCatalog).toBe(CARD_CATALOG);
    expect(after.runState?.enemyCatalog).toBe(ENEMY_CATALOG);
    expect(after.runState?.eventCatalog).toBe(EVENT_CATALOG);
    expect(after.targeting).toEqual(EMPTY_TARGETING);
    expect(after.pendingEvents).toEqual([]);
    expect(after.isResolvingEnemyTurn).toBe(false);
  });
});
