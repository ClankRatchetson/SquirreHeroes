import type { CombatState, DiscardEffect, DrawEffect, ExhaustEffect, GainEnergyEffect } from "../types";
import { nextInt, shuffle } from "../rng";
import type { EffectResolutionContext } from "./context";

function drawOneCard(state: CombatState): CombatState {
  if (state.drawPile.length === 0) {
    if (state.discardPile.length === 0) {
      return state;
    }
    const [reshuffled, rng] = shuffle(state.rng, state.discardPile);
    state = { ...state, drawPile: reshuffled, discardPile: [], rng };
  }
  const [drawn, ...rest] = state.drawPile;
  if (!drawn) {
    return state;
  }
  return { ...state, drawPile: rest, hand: [...state.hand, drawn] };
}

export function applyDrawEffect(state: CombatState, effect: DrawEffect): CombatState {
  let current = state;
  for (let i = 0; i < effect.amount; i += 1) {
    current = drawOneCard(current);
  }
  return current;
}

export function applyGainEnergyEffect(state: CombatState, effect: GainEnergyEffect): CombatState {
  return { ...state, energy: state.energy + effect.amount };
}

function discardOneRandomCard(state: CombatState): CombatState {
  if (state.hand.length === 0) {
    return state;
  }
  const [index, rng] = nextInt(state.rng, state.hand.length);
  const card = state.hand[index];
  if (!card) {
    return state;
  }
  const hand = state.hand.filter((_, i) => i !== index);
  return { ...state, hand, discardPile: [...state.discardPile, card], rng };
}

export function applyDiscardEffect(state: CombatState, effect: DiscardEffect): CombatState {
  let current = state;
  for (let i = 0; i < effect.amount; i += 1) {
    current = discardOneRandomCard(current);
  }
  return current;
}

export function applyExhaustEffect(
  state: CombatState,
  _effect: ExhaustEffect,
  ctx: EffectResolutionContext,
): CombatState {
  const card = ctx.resolvingCard;
  if (!card) {
    return state;
  }
  if (state.exhaustPile.some((c) => c.instanceId === card.instanceId)) {
    return state;
  }
  return { ...state, exhaustPile: [...state.exhaustPile, card] };
}
