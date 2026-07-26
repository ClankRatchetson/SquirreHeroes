import type { CombatState } from "../types";

/** Dérive `victoire`/`defaite`/`en_cours` — à appeler après toute mutation de PV. */
export function checkCombatOutcome(state: CombatState): CombatState {
  if (state.hero.hp <= 0) {
    return { ...state, outcome: "defaite", phase: "combat_over" };
  }
  if (state.enemies.length > 0 && state.enemies.every((e) => e.hp <= 0)) {
    return { ...state, outcome: "victoire", phase: "combat_over" };
  }
  return state;
}
