import { beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { makeRunState } from "../engine/helpers";

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

const { useMetaStore } = await import("../../src/ui/store/meta-store");
const { useRunStore } = await import("../../src/ui/store/run-store");

describe("useMetaStore", () => {
  beforeEach(() => {
    fakeAdapter.load.mockClear();
    fakeAdapter.save.mockClear();
    fakeAdapter.clear.mockClear();
    useMetaStore.setState({ meta: INITIAL_META_PROGRESSION });
    useRunStore.setState({ runState: null, targeting: { selectedCardInstanceId: null, hoveredEnemyInstanceId: null }, pendingEvents: [], isResolvingEnemyTurn: false });
  });

  it("setMeta hydrate sans persister", () => {
    const meta = { ...INITIAL_META_PROGRESSION, glandsDor: 99 };
    useMetaStore.getState().setMeta(meta);
    expect(useMetaStore.getState().meta).toEqual(meta);
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });

  it("purchaseNode no-op (référence meta inchangée, aucune persistance) si Glands d'Or insuffisants", () => {
    const before = useMetaStore.getState().meta;
    useMetaStore.getState().purchaseNode("pv_max_1");
    expect(useMetaStore.getState().meta).toBe(before);
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });

  it("purchaseNode déduit le coût, débloque le nœud, et persiste", () => {
    useMetaStore.setState({ meta: { ...INITIAL_META_PROGRESSION, glandsDor: 30 } });
    useMetaStore.getState().purchaseNode("pv_max_1");

    const meta = useMetaStore.getState().meta;
    expect(meta.glandsDor).toBe(0);
    expect(meta.unlockedTreeNodeIds).toEqual(["pv_max_1"]);
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { meta: unknown };
    expect(saved.meta).toEqual(meta);
  });

  it("purchaseNode d'un id inexistant est un no-op", () => {
    const before = useMetaStore.getState().meta;
    useMetaStore.getState().purchaseNode("does-not-exist");
    expect(useMetaStore.getState().meta).toBe(before);
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });

  it("recordRunStart incrémente totalRunsStarted et persiste", () => {
    useMetaStore.getState().recordRunStart();
    expect(useMetaStore.getState().meta.totalRunsStarted).toBe(1);
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
  });

  it("recordRunStart persiste le runState courant de useRunStore", () => {
    const runState = makeRunState();
    useRunStore.setState({ runState });
    useMetaStore.getState().recordRunStart();

    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { currentRun: { heroId: string } | null };
    expect(saved.currentRun?.heroId).toBe(runState.heroId);
  });

  it("recordRunCompletion applique applyRunCompletion et persiste la run terminée", () => {
    const finishedRun = makeRunState({
      outcome: "victoire",
      phase: "run_over",
      visitedNodeIds: ["n0", "n1"],
      bossesDefeatedThisRun: ["test_enemy"], // acts[0] par défaut a bossEnemyIds: ["test_enemy"]
    });
    useMetaStore.getState().recordRunCompletion(finishedRun);

    const meta = useMetaStore.getState().meta;
    expect(meta.totalVictories).toBe(1);
    expect(meta.actICompleted).toBe(true);
    expect(meta.glandsDor).toBe(10);
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { currentRun: { outcome: string } | null; meta: unknown };
    expect(saved.currentRun?.outcome).toBe("victoire");
    expect(saved.meta).toEqual(meta);
  });

  it("completeTutorial marque tutorialCompleted et persiste", () => {
    useMetaStore.getState().completeTutorial();
    expect(useMetaStore.getState().meta.tutorialCompleted).toBe(true);
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { meta: { tutorialCompleted: boolean } };
    expect(saved.meta.tutorialCompleted).toBe(true);
  });

  it("completeTutorial est un no-op (aucune persistance) si déjà marqué", () => {
    useMetaStore.setState({ meta: { ...INITIAL_META_PROGRESSION, tutorialCompleted: true } });
    const before = useMetaStore.getState().meta;
    useMetaStore.getState().completeTutorial();
    expect(useMetaStore.getState().meta).toBe(before);
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });

  it("resetTutorial démarque tutorialCompleted et persiste", () => {
    useMetaStore.setState({ meta: { ...INITIAL_META_PROGRESSION, tutorialCompleted: true } });
    useMetaStore.getState().resetTutorial();
    expect(useMetaStore.getState().meta.tutorialCompleted).toBe(false);
    expect(fakeAdapter.save).toHaveBeenCalledTimes(1);
    const saved = fakeAdapter.save.mock.calls[0]?.[0] as { meta: { tutorialCompleted: boolean } };
    expect(saved.meta.tutorialCompleted).toBe(false);
  });

  it("resetTutorial est un no-op (aucune persistance) si déjà à false", () => {
    const before = useMetaStore.getState().meta;
    useMetaStore.getState().resetTutorial();
    expect(useMetaStore.getState().meta).toBe(before);
    expect(fakeAdapter.save).not.toHaveBeenCalled();
  });
});
