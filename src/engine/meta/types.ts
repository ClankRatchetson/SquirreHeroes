import type { CardId, EnemyId, TranslationKey } from "../types";

export interface MetaBonusMaxHpEffect {
  readonly kind: "bonusMaxHp";
  readonly amount: number;
}

export interface MetaUpgradeStartingCardEffect {
  readonly kind: "upgradeStartingCard";
  readonly cardId: CardId;
}

export interface MetaNoisettesBonusPerCombatEffect {
  readonly kind: "noisettesBonusPerCombat";
  readonly amount: number;
}

export type MetaTreeNodeEffect =
  | MetaBonusMaxHpEffect
  | MetaUpgradeStartingCardEffect
  | MetaNoisettesBonusPerCombatEffect;

export interface MetaTreeNode {
  readonly id: string;
  readonly nameKey: TranslationKey;
  readonly descriptionKey: TranslationKey;
  readonly cost: number;
  /** Chaîne de prérequis linéaire — absent signifie racine de sa branche. */
  readonly prerequisiteId?: string | undefined;
  readonly effect: MetaTreeNodeEffect;
}

/**
 * Canal A (jalons) + Canal B (arbre de Glands d'Or). Persistée telle
 * quelle sur `SaveFile` — ne contient aucun catalogue de contenu injecté,
 * contrairement à `RunState`, donc aucune variante "Persisted" séparée
 * n'est nécessaire.
 */
export interface MetaProgression {
  readonly totalRunsStarted: number;
  readonly totalVictories: number;
  readonly totalDefeats: number;
  readonly actICompleted: boolean;
  readonly bossesDefeated: readonly EnemyId[];
  readonly glandsDor: number;
  readonly unlockedTreeNodeIds: readonly string[];
  /** Vrai dès que le tutoriel de premier combat a été vu (terminé OU passé) — ne se réaffiche jamais après. */
  readonly tutorialCompleted: boolean;
}

/** Bonus agrégés d'un ensemble de nœuds débloqués, consommables par `createRun`. */
export interface AggregatedTreeBonuses {
  readonly bonusMaxHp: number;
  readonly upgradedStartingCardIds: readonly CardId[];
  readonly noisettesBonusPerCombat: number;
}
