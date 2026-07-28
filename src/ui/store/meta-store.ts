import { create } from "zustand";
import { applyRunCompletion, INITIAL_META_PROGRESSION, purchaseTreeNode } from "../../engine/meta";
import { META_TREE } from "../../content/meta-tree";
import { persistCurrentSaveFile } from "../persistence/persist-save-file";
import { useRunStore } from "./run-store";
import type { MetaStoreState } from "./meta-store.types";

/**
 * Store Zustand de la méta-progression (Phase 5) — miroir de `run-store.ts`.
 * Référence `useRunStore` uniquement via `getState()` à l'intérieur des
 * corps d'action (jamais au niveau module) : `run-store.ts` référence ce
 * store de la même façon, aucun des deux fichiers ne touche les exports de
 * l'autre à l'évaluation du module, donc pas de cycle réel malgré l'import
 * mutuel.
 */
export const useMetaStore = create<MetaStoreState>((set, get) => ({
  meta: INITIAL_META_PROGRESSION,

  setMeta: (meta) => {
    set({ meta });
  },

  purchaseNode: (nodeId) => {
    const prevMeta = get().meta;
    const nextMeta = purchaseTreeNode(prevMeta, META_TREE, nodeId);
    if (nextMeta === prevMeta) {
      return;
    }
    set({ meta: nextMeta });
    persistCurrentSaveFile(useRunStore.getState().runState, nextMeta);
  },

  recordRunStart: () => {
    const prevMeta = get().meta;
    const nextMeta = { ...prevMeta, totalRunsStarted: prevMeta.totalRunsStarted + 1 };
    set({ meta: nextMeta });
    persistCurrentSaveFile(useRunStore.getState().runState, nextMeta);
  },

  recordRunCompletion: (finishedRun) => {
    const prevMeta = get().meta;
    const nextMeta = applyRunCompletion(prevMeta, finishedRun);
    set({ meta: nextMeta });
    persistCurrentSaveFile(finishedRun, nextMeta);
  },

  completeTutorial: () => {
    const prevMeta = get().meta;
    if (prevMeta.tutorialCompleted) {
      return;
    }
    const nextMeta = { ...prevMeta, tutorialCompleted: true };
    set({ meta: nextMeta });
    persistCurrentSaveFile(useRunStore.getState().runState, nextMeta);
  },

  resetTutorial: () => {
    const prevMeta = get().meta;
    if (!prevMeta.tutorialCompleted) {
      return;
    }
    const nextMeta = { ...prevMeta, tutorialCompleted: false };
    set({ meta: nextMeta });
    persistCurrentSaveFile(useRunStore.getState().runState, nextMeta);
  },
}));
