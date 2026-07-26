import type {
  BlockEffect,
  CombatState,
  DamageAllEffect,
  DamageEffect,
  HealEffect,
  MultiHitEffect,
} from "../types";
import { computeIncomingDamage, computeOutgoingBlock, computeOutgoingDamage, applyHeal } from "./status-math";
import { getCombatant, withCombatantPatch, type CombatantRef } from "./combatant-ref";
import { resolveTargets } from "./targeting";
import { applyThorns } from "./thorns";
import type { EffectResolutionContext } from "./context";

function dealDamageToTarget(
  state: CombatState,
  targetRef: CombatantRef,
  baseAmount: number,
  attackerRef: CombatantRef,
): CombatState {
  const attacker = getCombatant(state, attackerRef);
  const outgoing = computeOutgoingDamage(baseAmount, attacker.statuses);
  const defender = getCombatant(state, targetRef);
  const { damageToHp, remainingBlock } = computeIncomingDamage(outgoing, defender.statuses, defender.block);
  const next = withCombatantPatch(state, targetRef, {
    hp: Math.max(0, defender.hp - damageToHp),
    block: remainingBlock,
  });
  return damageToHp > 0 ? applyThorns(next, targetRef, attackerRef) : next;
}

export function applyDamageEffect(
  state: CombatState,
  effect: DamageEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  return targets.reduce((s, ref) => dealDamageToTarget(s, ref, effect.amount, ctx.actingSide), state);
}

export function applyDamageAllEffect(
  state: CombatState,
  effect: DamageAllEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, "all_enemies", ctx);
  return targets.reduce((s, ref) => dealDamageToTarget(s, ref, effect.amount, ctx.actingSide), state);
}

export function applyMultiHitEffect(
  state: CombatState,
  effect: MultiHitEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  let current = state;
  for (const ref of targets) {
    for (let i = 0; i < effect.hits; i += 1) {
      current = dealDamageToTarget(current, ref, effect.amountPerHit, ctx.actingSide);
    }
  }
  return current;
}

export function applyBlockEffect(
  state: CombatState,
  effect: BlockEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  const isDefenseCard = ctx.resolvingCardType === "defense";
  return targets.reduce((s, ref) => {
    const view = getCombatant(s, ref);
    const gained = computeOutgoingBlock(effect.amount, view.statuses, isDefenseCard);
    return withCombatantPatch(s, ref, { block: view.block + gained });
  }, state);
}

export function applyHealEffect(
  state: CombatState,
  effect: HealEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const targets = resolveTargets(state, effect.target, ctx);
  return targets.reduce((s, ref) => {
    const view = getCombatant(s, ref);
    return withCombatantPatch(s, ref, { hp: applyHeal(view.hp, view.maxHp, effect.amount) });
  }, state);
}
