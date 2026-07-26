import { useMemo } from "react";
import { isCardPlayable } from "../../engine/core";
import type { CombatState } from "../../engine/types";

/** Mémoïse l'appel au sélecteur moteur — jamais de state React séparé qui pourrait désynchroniser. */
export function useIsCardPlayable(
  state: CombatState | null,
  cardInstanceId: string,
  targetEnemyId?: string,
): boolean {
  return useMemo(() => {
    if (!state) {
      return false;
    }
    return isCardPlayable(state, cardInstanceId, targetEnemyId);
  }, [state, cardInstanceId, targetEnemyId]);
}
