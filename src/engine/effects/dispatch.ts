import type { CombatState, EffectSpec } from "../types";
import type { EffectResolutionContext } from "./context";
import {
  applyBlockEffect,
  applyDamageAllEffect,
  applyDamageEffect,
  applyHealEffect,
  applyMultiHitEffect,
} from "./combat-effects";
import { applyDiscardEffect, applyDrawEffect, applyExhaustEffect, applyGainEnergyEffect } from "./resource-effects";
import { applyApplyStatusEffect, applyDoubleStatusEffect, applyRemoveStatusEffect } from "./status-effects";
import { applyConditionalEffect } from "./conditional";

type EffectHandler<E extends EffectSpec> = (
  state: CombatState,
  effect: E,
  ctx: EffectResolutionContext,
) => CombatState;

type HandlerMap = { [K in EffectSpec["kind"]]: EffectHandler<Extract<EffectSpec, { kind: K }>> };

/**
 * Registre des primitives. Ce type mappé force le compilateur à refuser la
 * compilation si un membre est ajouté à `EffectSpec` sans handler
 * correspondant — c'est ce mécanisme, pas une pré-réservation de
 * primitives inutilisées, qui garantit que le dispatcher reste ouvert à
 * l'ajout de nouvelles primitives (Phase 7) sans réécrire le réducteur.
 */
const EFFECT_HANDLERS: HandlerMap = {
  damage: applyDamageEffect,
  damageAll: applyDamageAllEffect,
  multiHit: applyMultiHitEffect,
  block: applyBlockEffect,
  heal: applyHealEffect,
  draw: applyDrawEffect,
  gainEnergy: applyGainEnergyEffect,
  discard: applyDiscardEffect,
  exhaust: applyExhaustEffect,
  applyStatus: applyApplyStatusEffect,
  removeStatus: applyRemoveStatusEffect,
  doubleStatus: applyDoubleStatusEffect,
  conditional: applyConditionalEffect,
};

export function resolveEffect(
  state: CombatState,
  effect: EffectSpec,
  ctx: EffectResolutionContext,
): CombatState {
  const handler = EFFECT_HANDLERS[effect.kind] as EffectHandler<EffectSpec>;
  return handler(state, effect, ctx);
}

export function resolveEffects(
  state: CombatState,
  effects: readonly EffectSpec[],
  ctx: EffectResolutionContext,
): CombatState {
  return effects.reduce((s, effect) => resolveEffect(s, effect, ctx), state);
}
