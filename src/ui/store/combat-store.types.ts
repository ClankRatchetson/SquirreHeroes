import type { CombatState } from "../../engine/types";

/** État d'interaction pur — jamais mélangé à `engineState`, le moteur n'a aucune notion de "carte sélectionnée". */
export interface TargetingState {
  readonly selectedCardInstanceId: string | null;
  readonly hoveredEnemyInstanceId: string | null;
}

export type CombatDisplayEventKind = "damage" | "block" | "heal";

/** Événement d'affichage dérivé d'un diff avant/après — jamais une règle de jeu, juste un delta déjà produit par le moteur. */
export interface CombatDisplayEvent {
  readonly id: string;
  readonly kind: CombatDisplayEventKind;
  readonly targetId: string;
  readonly amount: number;
}

export interface CombatStoreState {
  readonly engineState: CombatState | null;
  readonly targeting: TargetingState;
  readonly pendingEvents: readonly CombatDisplayEvent[];
  readonly isResolvingEnemyTurn: boolean;

  readonly startNewCombat: (seed: number) => void;
  readonly selectCard: (cardInstanceId: string | null) => void;
  readonly hoverEnemy: (enemyInstanceId: string | null) => void;
  readonly playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  readonly endTurn: () => void;
  readonly consumeEvent: (eventId: string) => void;
}
