import type { CardId, HeroId } from "./card";
import type { TranslationKey } from "./i18n-key";

export interface HeroDefinition {
  readonly id: HeroId;
  readonly nameKey: TranslationKey;
  readonly maxHp: number;
  /** Liste à plat, avec doublons — une entrée par carte du deck de départ. */
  readonly startingDeck: readonly CardId[];
}
