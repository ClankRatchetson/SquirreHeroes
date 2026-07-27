import type { RunState } from "../types";

/** Dérive `defaite`/`en_cours` — à appeler après toute mutation de `heroHp` hors combat. */
export function checkRunOutcome(state: RunState): RunState {
  if (state.heroHp <= 0) {
    return { ...state, outcome: "defaite", phase: "run_over" };
  }
  return state;
}
