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
  // `bossesDefeatedThisRun` est accumulé pendant la run (cf. `resolveReward`), jamais dérivé
  // rétroactivement du nœud boss de la carte courante — celle-ci peut avoir été remplacée par
  // l'acte suivant après une victoire sur un boss intermédiaire. Non conditionné par `isVictory` :
  // un boss vaincu puis suivi d'une défaite plus loin dans la run compte quand même.
  const bossesDefeated = [...new Set([...meta.bossesDefeated, ...finishedRun.bossesDefeatedThisRun])];
  // L'Acte I est terminé si SON boss précisément (`acts[0]`) a été vaincu — pas "la run a été
  // gagnée", qui ne signifierait plus "Acte I" dès qu'un 2ᵉ acte existe (la victoire ne survient
  // qu'après le dernier acte configuré).
  const actIBossIds = finishedRun.acts[0]?.bossEnemyIds ?? [];
  const actICompleted =
    meta.actICompleted || actIBossIds.some((id) => finishedRun.bossesDefeatedThisRun.includes(id));

  return {
    ...meta,
    totalVictories: meta.totalVictories + (isVictory ? 1 : 0),
    totalDefeats: meta.totalDefeats + (isDefeat ? 1 : 0),
    actICompleted,
    bossesDefeated,
    glandsDor: meta.glandsDor + computeGlandsDorEarned(finishedRun),
  };
}
