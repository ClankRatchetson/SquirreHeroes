import type { MetaProgression } from "./types";

export const INITIAL_META_PROGRESSION: MetaProgression = {
  totalRunsStarted: 0,
  totalVictories: 0,
  totalDefeats: 0,
  actICompleted: false,
  bossesDefeated: [],
  glandsDor: 0,
  unlockedTreeNodeIds: [],
  tutorialCompleted: false,
};

/** Cf. justification du plan Phase 5 §2 — 5 Glands d'Or par nœud visité, indépendamment de l'issue de la run. */
export const GLANDS_DOR_PER_VISITED_NODE = 5;
