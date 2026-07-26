import type { EffectSpec } from "./effect";
import type { TranslationKey } from "./i18n-key";

export type CardId = string;
/** Un seul héros en Phase 1 — s'étendra en Phase 7 (Captain Cabriole, Docteur Bogue). */
export type HeroId = "casse_noix";
export type CardOwner = HeroId | "neutre";
export type CardType = "attaque" | "defense" | "competence" | "pouvoir" | "malediction";
export type Rarity = "commune" | "rare" | "legendaire";

export interface CardUpgrade {
  readonly nameKey: TranslationKey;
  readonly effects: readonly EffectSpec[];
}

export interface Card {
  readonly id: CardId;
  readonly nameKey: TranslationKey;
  readonly hero: CardOwner;
  readonly type: CardType;
  readonly rarity: Rarity;
  readonly cost: number;
  readonly effects: readonly EffectSpec[];
  readonly upgraded?: CardUpgrade | undefined;
  readonly art?: string | undefined;
  readonly flavorKey?: TranslationKey | undefined;
}
