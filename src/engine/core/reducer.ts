import type { CombatAction, CombatState } from "../types";
import { resolvePlayCard } from "./resolve-play-card";
import { resolveEndTurn } from "./end-turn";

/**
 * Point d'entrée unique du moteur : `(état, action) => nouvel état`. No-op
 * défensif sur toute action illégale ou hors phase — jamais d'exception.
 */
export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  if (state.phase !== "hero_turn") {
    return state;
  }
  switch (action.type) {
    case "PLAY_CARD":
      return resolvePlayCard(state, action);
    case "END_TURN":
      return resolveEndTurn(state);
  }
}
