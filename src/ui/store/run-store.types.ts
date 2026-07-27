import type { RunAction, RunState } from "../../engine/types";
import type { CombatDisplayEvent, TargetingState } from "./combat-store.types";

export interface RunStoreState {
  readonly runState: RunState | null;
  readonly targeting: TargetingState;
  readonly pendingEvents: readonly CombatDisplayEvent[];
  readonly isResolvingEnemyTurn: boolean;

  readonly startNewRun: (seed: number) => void;
  /** Actions génériques du run (carte, boutique, récompense, feu de camp, événement). */
  readonly dispatch: (action: RunAction) => void;
  /** Miroir de `CombatStoreState` pour permettre le partage des composants de combat via `CombatController`. */
  readonly selectCard: (cardInstanceId: string | null) => void;
  readonly hoverEnemy: (enemyInstanceId: string | null) => void;
  readonly playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  readonly endTurn: () => void;
  readonly consumeEvent: (eventId: string) => void;
}
