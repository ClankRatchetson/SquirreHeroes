import type { EffectSpec } from "./effect";
import type { TranslationKey } from "./i18n-key";

export type CardId = string;
export type HeroId = "casse_noix" | "captain_cabriole" | "docteur_bogue";
/** 4 familiers v1.0 (§3.3 des specs) — définis ici (pas dans `familiar.ts`) pour que `CardOwner` puisse les référencer sans import circulaire. */
export type FamiliarId = "mesange_radar" | "herisson_kevlar" | "bourdon_bourru" | "taupe_secrete";
export type CardOwner = HeroId | FamiliarId | "neutre";
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
