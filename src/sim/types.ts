import type { CardId, HeroId } from "../engine/types";

export interface HeroStats {
  readonly heroId: HeroId;
  readonly runsPlayed: number;
  readonly victories: number;
  readonly winRate: number;
}

/**
 * Aucun familier n'existe encore (reporté à la Phase 7) — ce type est prêt
 * à être peuplé, mais `BalanceReport.byFamiliar` reste un tableau vide tant
 * qu'aucun `FamiliarDefinition` n'existe réellement. Même précédent que le
 * Canal A de la Phase 5 : infrastructure réelle, jamais de contenu fictif.
 */
export interface FamiliarStats {
  readonly familiarId: string;
  readonly runsPlayed: number;
  readonly victories: number;
  readonly winRate: number;
}

export interface CardStats {
  readonly cardId: CardId;
  readonly timesOffered: number;
  readonly timesChosen: number;
  readonly pickRate: number;
  readonly runsWithCardInFinalDeck: number;
  readonly winsWithCardInFinalDeck: number;
  readonly winRateWhenPresent: number;
}

export interface CardBalanceFlags {
  readonly underPicked: readonly CardId[];
  readonly overPicked: readonly CardId[];
  readonly dominant: readonly CardId[];
}

export interface GlandsDorCapCheck {
  /** `totalBonusMaxHp / hero.maxHp` — seule composante du Canal B directement et littéralement "puissance de départ". */
  readonly hpBonusPercent: number;
  readonly baselineWinRate: number;
  readonly fullyUpgradedWinRate: number;
  readonly winRateDeltaPoints: number;
  readonly withinCap: boolean;
  readonly note: string;
}

export interface BalanceBatchResult {
  readonly runsPlayed: number;
  readonly victories: number;
  readonly winRate: number;
  readonly byHero: readonly HeroStats[];
  readonly byFamiliar: readonly FamiliarStats[];
  readonly byCard: readonly CardStats[];
  readonly flags: CardBalanceFlags;
}

export interface BalanceReport {
  readonly config: { readonly runs: number; readonly seed: number };
  readonly baseline: BalanceBatchResult;
  readonly fullyUpgraded: BalanceBatchResult;
  readonly glandsDorCapCheck: GlandsDorCapCheck;
}

/** Un enregistrement par run simulée — entrée brute agrégée ensuite par `aggregate.ts`. */
export interface SimRunRecord {
  readonly heroId: HeroId;
  readonly victory: boolean;
  /** Cartes offertes (récompense/boutique) durant cette run, avec le fait qu'elles aient été choisies ou non. */
  readonly cardOffers: readonly { readonly cardId: CardId; readonly chosen: boolean }[];
  /** `cardId` de chaque entrée du deck final (victoire ou défaite — l'état au moment de `run_over`). */
  readonly finalDeckCardIds: readonly CardId[];
}
