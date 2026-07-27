import type { RunDeckEntry, RunState } from "../types";

export const CAMPFIRE_HEAL_RATIO = 0.3;

/** 30% des PV manquants, arrondi bas — réutilisée par `resolveCampfireHeal` et l'aperçu UI. */
export function previewCampfireHeal(state: RunState): number {
  return Math.floor((state.heroMaxHp - state.heroHp) * CAMPFIRE_HEAL_RATIO);
}

export function resolveCampfireHeal(state: RunState): RunState {
  if (state.phase !== "feu_de_camp") {
    return state;
  }
  const healAmount = previewCampfireHeal(state);
  return { ...state, heroHp: Math.min(state.heroMaxHp, state.heroHp + healAmount), phase: "carte" };
}

export function resolveCampfireUpgrade(state: RunState, runCardId: string): RunState {
  if (state.phase !== "feu_de_camp") {
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
  return { ...state, deck: updatedDeck, phase: "carte" };
}
