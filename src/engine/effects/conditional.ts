import type { CombatState, ConditionalEffect } from "../types";
import { getStacks } from "./status-list";
import { getCombatant } from "./combatant-ref";
import { resolveTargets } from "./targeting";
import { resolveEffects } from "./dispatch";
import type { EffectResolutionContext } from "./context";

/**
 * Vérifie la présence du statut sur la première cible résolue, puis résout
 * la branche correspondante avec le même contexte (donc le même
 * `chosenEnemyId` que le reste de la carte). Pour `all_enemies`, seule la
 * première cible résolue est vérifiée — aucun contenu de test n'utilise ce
 * cas ambigu.
 */
export function applyConditionalEffect(
  state: CombatState,
  effect: ConditionalEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  const checkRef = targets[0];
  const isTrue = checkRef !== undefined && getStacks(getCombatant(state, checkRef).statuses, effect.status) > 0;
  return resolveEffects(state, isTrue ? effect.whenTrue : effect.whenFalse, ctx);
}
