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
 * Registre des primitives, construit paresseusement (mémoïsé au premier
 * appel) plutôt qu'en constante de module évaluée immédiatement.
 * `conditional.ts` importe `resolveEffects` d'ici (import circulaire
 * nécessaire : une carte peut résoudre un `conditional` dont les branches
 * contiennent elles-mêmes n'importe quelle primitive). Un objet construit
 * au chargement du module capturerait la valeur `applyConditionalEffect`
 * telle qu'elle est à CET instant précis — `undefined` si l'ordre
 * d'évaluation du graphe de modules atteint `dispatch.ts` avant que
 * `conditional.ts` n'ait fini d'exécuter son propre corps (ordre qui
 * dépend du point d'entrée important le moteur, donc pas garanti). Retarder
 * la construction jusqu'au premier appel réel évite le problème : à ce
 * moment-là, tout le graphe de modules a déjà fini de s'évaluer. Ce type
 * mappé force par ailleurs le compilateur à refuser la compilation si un
 * membre est ajouté à `EffectSpec` sans handler correspondant — c'est ce
 * mécanisme, pas une pré-réservation de primitives inutilisées, qui
 * garantit que le dispatcher reste ouvert à l'ajout de nouvelles
 * primitives (Phase 7) sans réécrire le réducteur.
 */
let handlers: HandlerMap | null = null;

function getHandlers(): HandlerMap {
  handlers ??= {
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
  return handlers;
}

export function resolveEffect(
  state: CombatState,
  effect: EffectSpec,
  ctx: EffectResolutionContext,
): CombatState {
  const handler = getHandlers()[effect.kind] as EffectHandler<EffectSpec>;
  return handler(state, effect, ctx);
}

export function resolveEffects(
  state: CombatState,
  effects: readonly EffectSpec[],
  ctx: EffectResolutionContext,
): CombatState {
  return effects.reduce((s, effect) => resolveEffect(s, effect, ctx), state);
}
