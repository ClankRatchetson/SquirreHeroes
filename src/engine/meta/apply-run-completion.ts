import type { RunState } from "../types";
import { GLANDS_DOR_PER_VISITED_NODE } from "./constants";
import type { MetaProgression } from "./types";

/** Récompense l'exploration/la progression peu importe l'issue — un run coupé court par une défaite n'est jamais mis à zéro. */
export function computeGlandsDorEarned(finishedRun: RunState): number {
  return finishedRun.visitedNodeIds.length * GLANDS_DOR_PER_VISITED_NODE;
}

/**
 * Dérive la `MetaProgression` mise à jour à partir d'une run terminée
 * (`phase === "run_over"`). Pure et déterministe — la fin d'une run est un
 * fait, pas un tirage. Ne touche jamais `totalRunsStarted` : ce compteur
 * est incrémenté séparément, au démarrage de la run (cf. `useMetaStore`).
 */
export function applyRunCompletion(meta: MetaProgression, finishedRun: RunState): MetaProgression {
  const isVictory = finishedRun.outcome === "victoire";
  const isDefeat = finishedRun.outcome === "defaite";
  const bossNode = finishedRun.map.nodes.find((n) => n.type === "boss");
  const newlyDefeatedBossIds = isVictory && bossNode?.enemyIds ? bossNode.enemyIds : [];
  const bossesDefeated = [...new Set([...meta.bossesDefeated, ...newlyDefeatedBossIds])];

  return {
    ...meta,
    totalVictories: meta.totalVictories + (isVictory ? 1 : 0),
    totalDefeats: meta.totalDefeats + (isDefeat ? 1 : 0),
    actICompleted: meta.actICompleted || isVictory,
    bossesDefeated,
    glandsDor: meta.glandsDor + computeGlandsDorEarned(finishedRun),
  };
}
