import type { RunDeckEntry, RunEffectSpec, RunState } from "../types";

function clampHp(hp: number, maxHp: number): number {
  return Math.min(maxHp, Math.max(0, hp));
}

export function resolveRunEffect(state: RunState, effect: RunEffectSpec): RunState {
  switch (effect.kind) {
    case "damage":
      return { ...state, heroHp: clampHp(state.heroHp - effect.amount, state.heroMaxHp) };
    case "heal":
      return { ...state, heroHp: clampHp(state.heroHp + effect.amount, state.heroMaxHp) };
    case "gainNoisettes":
      return { ...state, noisettes: state.noisettes + effect.amount };
    case "loseNoisettes":
      return { ...state, noisettes: Math.max(0, state.noisettes - effect.amount) };
    case "addCardToDeck": {
      const newEntry: RunDeckEntry = {
        runCardId: `run-card-${String(state.nextRunCardSeq)}`,
        cardId: effect.cardId,
        upgraded: false,
      };
      return { ...state, deck: [...state.deck, newEntry], nextRunCardSeq: state.nextRunCardSeq + 1 };
    }
  }
}

export function resolveEventChoice(state: RunState, choiceId: string): RunState {
  if (state.phase !== "evenement" || !state.pendingEventId) {
    return state;
  }
  const event = state.eventCatalog[state.pendingEventId];
  const choice = event?.choices.find((c) => c.id === choiceId);
  if (!event || !choice) {
    return state;
  }
  const afterEffects = choice.effects.reduce(resolveRunEffect, state);
  return { ...afterEffects, pendingEventId: null, phase: "carte" };
}
