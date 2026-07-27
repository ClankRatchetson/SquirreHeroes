import type { CardId } from "./card";

/**
 * Vocabulaire d'effets de run, séparé d'`EffectSpec` (combat) et
 * volontairement minimal (5 membres, un par besoin réel des 3 événements
 * d'exemple — même règle d'or que pour `EffectSpec`). Opère sur `RunState`
 * (PV/Noisettes/deck qui persistent entre combats), jamais sur `CombatState`
 * (main/pioche/énergie, éphémères à un seul combat) : réutiliser `EffectSpec`
 * ici serait un mensonge de typage, ces deux états n'ont rien en commun.
 */
export interface RunDamageEffect {
  readonly kind: "damage";
  readonly amount: number;
}

export interface RunHealEffect {
  readonly kind: "heal";
  readonly amount: number;
}

export interface RunGainNoisettesEffect {
  readonly kind: "gainNoisettes";
  readonly amount: number;
}

export interface RunLoseNoisettesEffect {
  readonly kind: "loseNoisettes";
  readonly amount: number;
}

export interface RunAddCardToDeckEffect {
  readonly kind: "addCardToDeck";
  readonly cardId: CardId;
}

export type RunEffectSpec =
  | RunDamageEffect
  | RunHealEffect
  | RunGainNoisettesEffect
  | RunLoseNoisettesEffect
  | RunAddCardToDeckEffect;
