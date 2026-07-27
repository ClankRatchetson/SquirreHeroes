import type { Card, CardId, CardOwner, HeroId, RunDeckEntry, RunState, ShopOffer, ShopOfferSlot } from "../types";
import { shuffle, type RngState } from "../rng";

export const CARD_PRICE_BY_RARITY: Readonly<Record<Card["rarity"], number>> = {
  commune: 40,
  rare: 65,
  legendaire: 90,
};
export const UPGRADE_PRICE = 50;
export const REMOVE_PRICE = 35;
export const SHOP_CARD_SLOTS = 5;

/** Cf. `rewards.ts` : `Set` runtime pour éviter un faux positif ESLint tant qu'un seul héros existe. */
function eligibleCards(cardCatalog: Readonly<Record<CardId, Card>>, heroId: HeroId): readonly Card[] {
  const eligibleOwners: ReadonlySet<CardOwner> = new Set([heroId, "neutre"]);
  return Object.values(cardCatalog).filter((card) => eligibleOwners.has(card.hero) && card.type !== "malediction");
}

export function generateShopOffer(
  rng: RngState,
  cardCatalog: Readonly<Record<CardId, Card>>,
  heroId: HeroId,
): readonly [ShopOffer, RngState] {
  const [shuffled, nextRng] = shuffle(rng, eligibleCards(cardCatalog, heroId));
  const cardsForSale: readonly ShopOfferSlot[] = shuffled.slice(0, SHOP_CARD_SLOTS).map((card) => ({
    cardId: card.id,
    price: CARD_PRICE_BY_RARITY[card.rarity],
    purchased: false,
  }));
  return [{ cardsForSale, upgradePrice: UPGRADE_PRICE, removePrice: REMOVE_PRICE }, nextRng];
}

export function resolveBuyCard(state: RunState, cardId: CardId): RunState {
  if (state.phase !== "boutique" || !state.pendingShop) {
    return state;
  }
  const slotIndex = state.pendingShop.cardsForSale.findIndex((s) => s.cardId === cardId && !s.purchased);
  if (slotIndex === -1) {
    return state;
  }
  const slot = state.pendingShop.cardsForSale[slotIndex] as ShopOfferSlot;
  if (state.noisettes < slot.price) {
    return state;
  }
  const newEntry: RunDeckEntry = { runCardId: `run-card-${String(state.nextRunCardSeq)}`, cardId, upgraded: false };
  const updatedSlots = state.pendingShop.cardsForSale.map((s, i) => (i === slotIndex ? { ...s, purchased: true } : s));
  return {
    ...state,
    noisettes: state.noisettes - slot.price,
    deck: [...state.deck, newEntry],
    nextRunCardSeq: state.nextRunCardSeq + 1,
    pendingShop: { ...state.pendingShop, cardsForSale: updatedSlots },
  };
}

export function resolveBuyUpgrade(state: RunState, runCardId: string): RunState {
  if (state.phase !== "boutique" || !state.pendingShop) {
    return state;
  }
  if (state.noisettes < state.pendingShop.upgradePrice) {
    return state;
  }
  const entryIndex = state.deck.findIndex((e) => e.runCardId === runCardId);
  if (entryIndex === -1) {
    return state;
  }
  const entry = state.deck[entryIndex] as RunDeckEntry;
  if (entry.upgraded) {
    return state;
  }
  const card = state.cardCatalog[entry.cardId];
  if (!card?.upgraded) {
    return state;
  }
  const updatedDeck = state.deck.map((e, i) => (i === entryIndex ? { ...e, upgraded: true } : e));
  return { ...state, deck: updatedDeck, noisettes: state.noisettes - state.pendingShop.upgradePrice };
}

export function resolveBuyRemoval(state: RunState, runCardId: string): RunState {
  if (state.phase !== "boutique" || !state.pendingShop) {
    return state;
  }
  if (state.noisettes < state.pendingShop.removePrice) {
    return state;
  }
  if (!state.deck.some((e) => e.runCardId === runCardId)) {
    return state;
  }
  return {
    ...state,
    deck: state.deck.filter((e) => e.runCardId !== runCardId),
    noisettes: state.noisettes - state.pendingShop.removePrice,
  };
}

export function resolveLeaveShop(state: RunState): RunState {
  if (state.phase !== "boutique") {
    return state;
  }
  return { ...state, pendingShop: null, phase: "carte" };
}
