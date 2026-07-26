import type { CombatState } from "../types";
import { applyHeal, applyRawHpDamage } from "./status-math";
import { decrementStacks, getStacks } from "./status-list";
import { getCombatant, withCombatantPatch, type CombatantRef } from "./combatant-ref";

/**
 * Tick de fin de tour du PORTEUR du statut (pas systématiquement fin de
 * tour héros) : Sève empoisonnée inflige puis décrémente, puis Repousse
 * soigne puis décrémente. Les deux ignorent le blocage (dégâts/soin
 * directs). Ne vérifie pas l'issue du combat — c'est au code appelant
 * (`/src/engine/core`) de le faire après chaque tick.
 */
export function tickEndOfTurnStatuses(state: CombatState, bearerRef: CombatantRef): CombatState {
  let current = state;

  const poisonStacks = getStacks(getCombatant(current, bearerRef).statuses, "seve_empoisonnee");
  if (poisonStacks > 0) {
    const view = getCombatant(current, bearerRef);
    current = withCombatantPatch(current, bearerRef, {
      hp: applyRawHpDamage(view.hp, poisonStacks),
      statuses: decrementStacks(view.statuses, "seve_empoisonnee"),
    });
  }

  const repousseStacks = getStacks(getCombatant(current, bearerRef).statuses, "repousse");
  if (repousseStacks > 0) {
    const view = getCombatant(current, bearerRef);
    current = withCombatantPatch(current, bearerRef, {
      hp: applyHeal(view.hp, view.maxHp, repousseStacks),
      statuses: decrementStacks(view.statuses, "repousse"),
    });
  }

  return current;
}
