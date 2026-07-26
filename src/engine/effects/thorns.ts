import type { CombatState } from "../types";
import { applyRawHpDamage } from "./status-math";
import { getStacks } from "./status-list";
import { getCombatant, withCombatantPatch, type CombatantRef } from "./combatant-ref";

/**
 * Piquants : riposte immédiate qui ignore totalement le blocage de
 * l'attaquant. Appelée après chaque coup individuel qui inflige des dégâts
 * réels à l'HP (un `multiHit` de 3 coups déclenche donc 3 ripostes).
 */
export function applyThorns(
  state: CombatState,
  defenderRef: CombatantRef,
  attackerRef: CombatantRef,
): CombatState {
  const defender = getCombatant(state, defenderRef);
  const thornsStacks = getStacks(defender.statuses, "piquants");
  if (thornsStacks <= 0) {
    return state;
  }
  const attacker = getCombatant(state, attackerRef);
  return withCombatantPatch(state, attackerRef, { hp: applyRawHpDamage(attacker.hp, thornsStacks) });
}
