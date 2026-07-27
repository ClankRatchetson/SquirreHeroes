import type { Card, CardId, CardOwner, HeroId, RunDeckEntry, RunRewardOffer, RunState } from "../types";
import { shuffle, type RngState } from "../rng";

export const REWARD_TABLE: Readonly<Record<"combat" | "elite" | "boss", number>> = {
  combat: 15,
  elite: 30,
  boss: 60,
};

const REWARD_CARD_CHOICES = 3;

/**
 * `heroId`/`"neutre"` via un `Set` runtime plutôt qu'une comparaison directe
 * : un seul héros existe aujourd'hui, donc TypeScript prouverait la
 * comparaison directe toujours vraie (faux positif ESLint) — ce filtre
 * redevient effectif dès qu'un second héros existe (Phase 7).
 */
function eligibleCardIds(cardCatalog: Readonly<Record<CardId, Card>>, heroId: HeroId): readonly CardId[] {
  const eligibleOwners: ReadonlySet<CardOwner> = new Set([heroId, "neutre"]);
  return Object.values(cardCatalog)
    .filter((card) => eligibleOwners.has(card.hero) && card.type !== "malediction")
    .map((card) => card.id);
}

/** Récompense de nœud `combat`/`elite` (jamais `boss`, cf. `resolveReward`). */
export function generateRewardOffer(
  rng: RngState,
  cardCatalog: Readonly<Record<CardId, Card>>,
  heroId: HeroId,
  rewardKind: "combat" | "elite",
): readonly [RunRewardOffer, RngState] {
  const [shuffled, nextRng] = shuffle(rng, eligibleCardIds(cardCatalog, heroId));
  return [{ cardChoices: shuffled.slice(0, REWARD_CARD_CHOICES), noisettes: REWARD_TABLE[rewardKind] }, nextRng];
}

/** Les Noisettes de l'offre ont déjà été créditées à la victoire (cf. `resolveReward`) : ne reste que le choix de carte. */
export function resolveRewardClaimCard(state: RunState, cardId: CardId): RunState {
  if (state.phase !== "recompense" || !state.pendingReward || !state.pendingReward.cardChoices.includes(cardId)) {
    return state;
  }
  const newEntry: RunDeckEntry = { runCardId: `run-card-${String(state.nextRunCardSeq)}`, cardId, upgraded: false };
  return {
    ...state,
    deck: [...state.deck, newEntry],
    nextRunCardSeq: state.nextRunCardSeq + 1,
    pendingReward: null,
    phase: "carte",
  };
}

export function resolveRewardSkip(state: RunState): RunState {
  if (state.phase !== "recompense" || !state.pendingReward) {
    return state;
  }
  return { ...state, pendingReward: null, phase: "carte" };
}
