import type { ApplyStatusEffect, CombatState, DoubleStatusEffect, RemoveStatusEffect } from "../types";
import { addStacks, doubleStacks, removeStatusEntry } from "./status-list";
import { getCombatant, withCombatantPatch } from "./combatant-ref";
import { resolveTargets } from "./targeting";
import type { EffectResolutionContext } from "./context";

export function applyApplyStatusEffect(
  state: CombatState,
  effect: ApplyStatusEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  return targets.reduce((s, ref) => {
    const view = getCombatant(s, ref);
    return withCombatantPatch(s, ref, { statuses: addStacks(view.statuses, effect.status, effect.stacks) });
  }, state);
}

export function applyRemoveStatusEffect(
  state: CombatState,
  effect: RemoveStatusEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  return targets.reduce((s, ref) => {
    const view = getCombatant(s, ref);
    return withCombatantPatch(s, ref, { statuses: removeStatusEntry(view.statuses, effect.status) });
  }, state);
}

export function applyDoubleStatusEffect(
  state: CombatState,
  effect: DoubleStatusEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  return targets.reduce((s, ref) => {
    const view = getCombatant(s, ref);
    return withCombatantPatch(s, ref, { statuses: doubleStacks(view.statuses, effect.status) });
  }, state);
}
