import { createContext, useContext } from "react";
import type { CombatState } from "../engine/types";
import type { CombatDisplayEvent, TargetingState } from "./store/combat-store.types";

/**
 * Abstraction neutre permettant aux composants de combat de la Phase 2
 * (`CardView`, `EnemyRow`, `EnemyCard`, `HeroPanel`, `useCombatEventQueue`)
 * de fonctionner indifféremment depuis `useCombatStore` (mode démo) ou
 * `useRunStore` (mode run), sans dupliquer le tap/drag/ciblage/tooltips.
 */
export interface CombatController {
  readonly engineState: CombatState | null;
  readonly targeting: TargetingState;
  readonly isResolvingEnemyTurn: boolean;
  readonly pendingEvents: readonly CombatDisplayEvent[];
  readonly selectCard: (cardInstanceId: string | null) => void;
  readonly hoverEnemy: (enemyInstanceId: string | null) => void;
  readonly playCard: (cardInstanceId: string, targetEnemyId?: string) => void;
  readonly endTurn: () => void;
  readonly consumeEvent: (eventId: string) => void;
}

export const CombatControllerContext = createContext<CombatController | null>(null);

export function useCombatController(): CombatController {
  const controller = useContext(CombatControllerContext);
  if (!controller) {
    throw new Error("useCombatController doit être appelé sous un CombatControllerContext.Provider.");
  }
  return controller;
}
