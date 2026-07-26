import type { EffectSpec } from "./effect";
import type { TranslationKey } from "./i18n-key";

export type EnemyId = string;
export type MoveId = string;

export interface EnemyMoveDef {
  readonly id: MoveId;
  readonly nameKey: TranslationKey;
  readonly effects: readonly EffectSpec[];
}

/**
 * Un ennemi est décrit uniquement par des données : ses PV et un pattern de
 * moves cyclique, chaque move étant composé des MÊMES primitives d'effets
 * que les cartes. Aucune logique de combat spécifique à un ennemi ne doit
 * exister dans le moteur.
 */
export interface EnemyDefinition {
  readonly id: EnemyId;
  readonly nameKey: TranslationKey;
  readonly maxHp: number;
  readonly moves: readonly EnemyMoveDef[];
  readonly pattern: readonly MoveId[];
}
