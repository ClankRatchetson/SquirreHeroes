import type { StatusId } from "./status";

/** Cible relative au camp qui agit (héros ou ennemi) — cf. `resolveTargets`. */
export type SingleTarget = "self" | "enemy";
export type EffectTarget = SingleTarget | "all_enemies";

export interface DamageEffect {
  readonly kind: "damage";
  readonly target: SingleTarget;
  readonly amount: number;
}

export interface DamageAllEffect {
  readonly kind: "damageAll";
  readonly amount: number;
}

export interface MultiHitEffect {
  readonly kind: "multiHit";
  readonly target: SingleTarget;
  readonly hits: number;
  readonly amountPerHit: number;
}

export interface BlockEffect {
  readonly kind: "block";
  readonly target: SingleTarget;
  readonly amount: number;
}

export interface HealEffect {
  readonly kind: "heal";
  readonly target: SingleTarget;
  readonly amount: number;
}

export interface DrawEffect {
  readonly kind: "draw";
  readonly amount: number;
}

export interface GainEnergyEffect {
  readonly kind: "gainEnergy";
  readonly amount: number;
}

export interface DiscardEffect {
  readonly kind: "discard";
  readonly amount: number;
}

export interface ExhaustEffect {
  readonly kind: "exhaust";
}

export interface ApplyStatusEffect {
  readonly kind: "applyStatus";
  readonly target: EffectTarget;
  readonly status: StatusId;
  readonly stacks: number;
}

export interface RemoveStatusEffect {
  readonly kind: "removeStatus";
  readonly target: EffectTarget;
  readonly status: StatusId;
}

export interface DoubleStatusEffect {
  readonly kind: "doubleStatus";
  readonly target: EffectTarget;
  readonly status: StatusId;
}

export interface ConditionalEffect {
  readonly kind: "conditional";
  readonly target: EffectTarget;
  readonly status: StatusId;
  readonly whenTrue: readonly EffectSpec[];
  readonly whenFalse: readonly EffectSpec[];
}

/**
 * Vocabulaire d'effets fermé (§4.3 des specs). 13 primitives implémentées en
 * Phase 1 sur les 18 nommées — `repeat`, `addCardToHand`, `addCardToDeck`,
 * `sacrifice`, `scry` sont réservées pour la Phase 7 : aucune carte du
 * contenu de test n'en a besoin, donc elles ne sont ni typées ni
 * schématisées maintenant (règle d'or : on ajoute une primitive quand un
 * contenu réel la réclame, jamais par anticipation).
 */
export type EffectSpec =
  | DamageEffect
  | DamageAllEffect
  | MultiHitEffect
  | BlockEffect
  | HealEffect
  | DrawEffect
  | GainEnergyEffect
  | DiscardEffect
  | ExhaustEffect
  | ApplyStatusEffect
  | RemoveStatusEffect
  | DoubleStatusEffect
  | ConditionalEffect;

export type EffectKind = EffectSpec["kind"];
