import type { CardId, FamiliarId, HeroId } from "../engine/types";
import type {
  BalanceBatchResult,
  CardBalanceFlags,
  CardStats,
  FamiliarStats,
  GlandsDorCapCheck,
  HeroStats,
  SimRunRecord,
} from "./types";

/** Une carte offerte moins de 5 % du temps où elle apparaît est considérée sous-choisie. */
export const LOW_PICK_RATE_THRESHOLD = 0.05;
/** Une carte choisie plus de 90 % du temps où elle est offerte est considérée sur-choisie. */
export const HIGH_PICK_RATE_THRESHOLD = 0.9;
/** Écart (en points de taux de victoire) au-delà duquel une carte présente dans le deck final est jugée dominante. */
export const DOMINANCE_MARGIN = 0.15;
/** Taille d'échantillon minimale avant de considérer un taux de victoire par carte comme significatif. */
export const MIN_SAMPLE_SIZE = 30;

/**
 * Réduit un lot de runs simulées en statistiques par carte — pure, testable
 * sans exécuter de vraies runs. `cardIds` est l'univers COMPLET des cartes à
 * rapporter (passé par l'appelant, ex. `Object.keys(CARD_CATALOG)`) plutôt
 * que dérivé des seules cartes observées : une carte jamais offerte doit
 * quand même apparaître dans le rapport avec `timesOffered: 0`, sans quoi
 * elle serait silencieusement absente au lieu d'être détectée comme
 * problématique.
 */
function aggregateByCard(records: readonly SimRunRecord[], cardIds: readonly CardId[]): readonly CardStats[] {
  return cardIds.map((cardId) => {
    const offers = records.flatMap((r) => r.cardOffers.filter((o) => o.cardId === cardId));
    const timesOffered = offers.length;
    const timesChosen = offers.filter((o) => o.chosen).length;
    const pickRate = timesOffered > 0 ? timesChosen / timesOffered : 0;

    const runsWithCard = records.filter((r) => r.finalDeckCardIds.includes(cardId));
    const runsWithCardInFinalDeck = runsWithCard.length;
    const winsWithCardInFinalDeck = runsWithCard.filter((r) => r.victory).length;
    const winRateWhenPresent = runsWithCardInFinalDeck > 0 ? winsWithCardInFinalDeck / runsWithCardInFinalDeck : 0;

    return { cardId, timesOffered, timesChosen, pickRate, runsWithCardInFinalDeck, winsWithCardInFinalDeck, winRateWhenPresent };
  });
}

function buildCardBalanceFlags(byCard: readonly CardStats[], overallWinRate: number): CardBalanceFlags {
  return {
    underPicked: byCard.filter((c) => c.pickRate < LOW_PICK_RATE_THRESHOLD).map((c) => c.cardId),
    overPicked: byCard.filter((c) => c.pickRate > HIGH_PICK_RATE_THRESHOLD).map((c) => c.cardId),
    dominant: byCard
      .filter((c) => c.runsWithCardInFinalDeck >= MIN_SAMPLE_SIZE && c.winRateWhenPresent - overallWinRate > DOMINANCE_MARGIN)
      .map((c) => c.cardId),
  };
}

function aggregateByHero(records: readonly SimRunRecord[]): readonly HeroStats[] {
  // Regroupement par Map plutôt que par filtre-sur-égalité : `HeroId` n'a qu'une seule valeur
  // littérale possible tant que la Phase 7 n'ajoute pas de héros, ce qui rendrait un
  // `r.heroId === heroId` trivialement toujours vrai aux yeux du compilateur.
  const byHeroId = new Map<HeroId, SimRunRecord[]>();
  for (const record of records) {
    const bucket = byHeroId.get(record.heroId) ?? [];
    bucket.push(record);
    byHeroId.set(record.heroId, bucket);
  }
  return [...byHeroId.entries()].map(([heroId, heroRecords]) => {
    const victories = heroRecords.filter((r) => r.victory).length;
    return {
      heroId,
      runsPlayed: heroRecords.length,
      victories,
      winRate: heroRecords.length > 0 ? victories / heroRecords.length : 0,
    };
  });
}

/** Miroir d'`aggregateByHero` : les runs sans familier (`familiarId: null`) ne sont pas comptées ici. */
function aggregateByFamiliar(records: readonly SimRunRecord[]): readonly FamiliarStats[] {
  const byFamiliarId = new Map<FamiliarId, SimRunRecord[]>();
  for (const record of records) {
    if (record.familiarId === null) {
      continue;
    }
    const bucket = byFamiliarId.get(record.familiarId) ?? [];
    bucket.push(record);
    byFamiliarId.set(record.familiarId, bucket);
  }
  return [...byFamiliarId.entries()].map(([familiarId, familiarRecords]) => {
    const victories = familiarRecords.filter((r) => r.victory).length;
    return {
      familiarId,
      runsPlayed: familiarRecords.length,
      victories,
      winRate: familiarRecords.length > 0 ? victories / familiarRecords.length : 0,
    };
  });
}

/** Réduit un lot de `SimRunRecord` en `BalanceBatchResult` — fonction pure, aucune simulation ici. */
export function aggregateBatch(records: readonly SimRunRecord[], cardIds: readonly CardId[]): BalanceBatchResult {
  const runsPlayed = records.length;
  const victories = records.filter((r) => r.victory).length;
  const winRate = runsPlayed > 0 ? victories / runsPlayed : 0;
  const byCard = aggregateByCard(records, cardIds);

  return {
    runsPlayed,
    victories,
    winRate,
    byHero: aggregateByHero(records),
    byFamiliar: aggregateByFamiliar(records),
    byCard,
    flags: buildCardBalanceFlags(byCard, winRate),
  };
}

/**
 * Valide le plafond de +20 % de puissance effective de départ du Canal B
 * (cf. CLAUDE.md, garde-fou d'équilibrage). `hpBonusPercent` est la seule
 * composante directement et littéralement mesurable comme "puissance de
 * départ" (les PV max) — c'est elle qui porte le verdict `withinCap`. Les
 * bonus non-PV (carte améliorée, Noisette bonus) n'ont pas de conversion
 * directe en puissance ; ils sont corroborés par l'écart de taux de
 * victoire empirique entre les 2 lots simulés plutôt que par une formule
 * de conversion arbitraire.
 */
export function buildGlandsDorCapCheck(params: {
  readonly heroMaxHp: number;
  readonly totalBonusMaxHp: number;
  readonly baselineWinRate: number;
  readonly fullyUpgradedWinRate: number;
}): GlandsDorCapCheck {
  const hpBonusPercent = (params.totalBonusMaxHp / params.heroMaxHp) * 100;
  const winRateDeltaPoints = (params.fullyUpgradedWinRate - params.baselineWinRate) * 100;
  return {
    hpBonusPercent,
    baselineWinRate: params.baselineWinRate,
    fullyUpgradedWinRate: params.fullyUpgradedWinRate,
    winRateDeltaPoints,
    withinCap: hpBonusPercent <= 20,
    note:
      "Plafond vérifié sur le bonus de PV max (seule composante directement mesurable comme puissance de " +
      "départ). L'écart de taux de victoire entre le lot sans bonus et le lot à l'arbre complet corrobore " +
      "empiriquement l'impact des bonus non-PV (carte améliorée, Noisette bonus) sans formule de conversion arbitraire.",
  };
}
