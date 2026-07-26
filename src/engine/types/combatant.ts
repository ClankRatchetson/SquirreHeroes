import type { EnemyId, EnemyMoveDef, MoveId } from "./enemy";
import type { StatusInstance } from "./status";
import type { TranslationKey } from "./i18n-key";

export interface HeroState {
  readonly maxHp: number;
  readonly hp: number;
  readonly block: number;
  readonly statuses: readonly StatusInstance[];
  /** Si vrai, le blocage n'est pas remis à zéro en début de tour héros. */
  readonly retainsBlock: boolean;
}

export interface EnemyInstance {
  readonly instanceId: string;
  readonly defId: EnemyId;
  readonly nameKey: TranslationKey;
  readonly maxHp: number;
  readonly hp: number;
  readonly block: number;
  readonly statuses: readonly StatusInstance[];
  readonly movesTaken: number;
  /** Intention figée au début du tour héros — jamais recalculée ailleurs. */
  readonly intent: EnemyMoveDef;
  readonly pattern: readonly MoveId[];
  readonly moves: Readonly<Record<MoveId, EnemyMoveDef>>;
}
