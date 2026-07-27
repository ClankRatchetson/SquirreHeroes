import type { AggregatedTreeBonuses } from "../../engine/meta";
import type { FamiliarDefinition, HeroDefinition, RunAction, RunState } from "../../engine/types";
import type { PersistedRunState } from "../../persistence";
import type { CombatDisplayEvent, TargetingState } from "./combat-store.types";

export interface RunStoreState {
  readonly runState: RunState | null;
  readonly targeting: TargetingState;
  readonly pendingEvents: readonly CombatDisplayEvent[];
  readonly isResolvingEnemyTurn: boolean;

  /**
   * `bonuses` : agrégat de l'arbre de Glands d'Or (Phase 5), calculé par
   * l'écran de sélection de héros. `hero` : héros choisi (Phase 7 lot 1/2)
   * — par défaut Casse-Noix si omis. `familiar` : familier choisi (Phase 7
   * lot 3), additif — aucun familier si omis (rétrocompatible).
   */
  readonly startNewRun: (
    seed: number,
    bonuses?: AggregatedTreeBonuses,
    hero?: HeroDefinition,
    familiar?: FamiliarDefinition,
  ) => void;
  /** Reprend une run sauvegardée : réattache les catalogues vivants, remet à zéro l'état UI éphémère. */
  readonly hydrateRun: (persisted: PersistedRunState) => void;
  /** Actions génériques du run (carte, boutique, récompense, feu de camp, événement). */
  readonly dispatch: (action: RunAction) => void;
  /** Miroir de `CombatStoreState` pour permettre le partage des composants de combat via `CombatController`. */
  readonly selectCard: (cardInstanceId: string | null) => void;
  readonly hoverEnemy: (enemyInstanceId: string | null) => void;
  readonly playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  readonly endTurn: () => void;
  readonly consumeEvent: (eventId: string) => void;
}
