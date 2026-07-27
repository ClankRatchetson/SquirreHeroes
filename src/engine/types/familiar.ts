import type { CardId, FamiliarId } from "./card";
import type { TranslationKey } from "./i18n-key";

/**
 * Vocabulaire fermé, 4 membres — un par familier réel (§3.3 des specs),
 * même discipline que `RunEffectSpec` : on n'ajoute une variante que si un
 * familier concret en a besoin. Distinct d'`EffectSpec` (cartes) : ces
 * passifs ne sont jamais joués, ils se déclenchent automatiquement à des
 * moments précis du cycle de combat (1er tour, tous les N tours, fin de
 * tour), jamais via `resolveEffects`.
 */
export interface FamiliarBonusDrawFirstTurn {
  readonly kind: "bonusDrawFirstTurn";
  readonly amount: number;
}

export interface FamiliarBonusBlockFirstTurn {
  readonly kind: "bonusBlockFirstTurn";
  readonly amount: number;
}

export interface FamiliarDamageRandomEnemyEndOfTurn {
  readonly kind: "damageRandomEnemyEndOfTurn";
  readonly amount: number;
}

export interface FamiliarBonusEnergyEveryNTurns {
  readonly kind: "bonusEnergyEveryNTurns";
  readonly amount: number;
  readonly everyNTurns: number;
}

export type FamiliarPassive =
  | FamiliarBonusDrawFirstTurn
  | FamiliarBonusBlockFirstTurn
  | FamiliarDamageRandomEnemyEndOfTurn
  | FamiliarBonusEnergyEveryNTurns;

/** Le familier n'est jamais une unité ciblable (§3.3) : pas de PV/statuts, seulement une identité et un passif. */
export interface FamiliarDefinition {
  readonly id: FamiliarId;
  readonly nameKey: TranslationKey;
  readonly passive: FamiliarPassive;
  readonly signatureCardId: CardId;
}
