import type { CombatState, EffectSpec, PlayCardAction } from "../types";
import { resolveEffects, type EffectResolutionContext } from "../effects";
import { checkCombatOutcome } from "./outcome";

function effectsOf(state: CombatState, cardInstanceId: string): readonly EffectSpec[] | undefined {
  const cardInstance = state.hand.find((c) => c.instanceId === cardInstanceId);
  if (!cardInstance) {
    return undefined;
  }
  const card = state.cardCatalog[cardInstance.cardId];
  if (!card) {
    return undefined;
  }
  return cardInstance.upgraded && card.upgraded ? card.upgraded.effects : card.effects;
}

/**
 * Ne regarde que le niveau supérieur des effets (pas les branches
 * `conditional` imbriquées) pour détecter un besoin de cible ennemie
 * unique — suffisant pour le contenu de test, aucune carte n'a de cible
 * ennemie cachée dans une branche conditionnelle.
 */
function needsSingleEnemyTarget(effects: readonly EffectSpec[]): boolean {
  return effects.some((effect) => "target" in effect && effect.target === "enemy");
}

export function isCardPlayable(
  state: CombatState,
  cardInstanceId: string,
  targetEnemyId?: string,
): boolean {
  if (state.phase !== "hero_turn") {
    return false;
  }
  const cardInstance = state.hand.find((c) => c.instanceId === cardInstanceId);
  if (!cardInstance) {
    return false;
  }
  const card = state.cardCatalog[cardInstance.cardId];
  if (!card || card.type === "malediction") {
    return false;
  }
  if (state.energy < card.cost) {
    return false;
  }

  const effects = effectsOf(state, cardInstanceId);
  if (!effects) {
    return false;
  }
  if (needsSingleEnemyTarget(effects)) {
    const aliveEnemies = state.enemies.filter((e) => e.hp > 0);
    if (aliveEnemies.length === 0) {
      return false;
    }
    if (aliveEnemies.length > 1) {
      if (targetEnemyId === undefined || !aliveEnemies.some((e) => e.instanceId === targetEnemyId)) {
        return false;
      }
    }
  }
  return true;
}

export function resolvePlayCard(state: CombatState, action: PlayCardAction): CombatState {
  if (!isCardPlayable(state, action.cardInstanceId, action.targetEnemyId)) {
    return state;
  }
  const cardInstance = state.hand.find((c) => c.instanceId === action.cardInstanceId);
  const card = cardInstance ? state.cardCatalog[cardInstance.cardId] : undefined;
  const effects = effectsOf(state, action.cardInstanceId);
  if (!cardInstance || !card || !effects) {
    return state;
  }

  const stateAfterRemoval: CombatState = {
    ...state,
    hand: state.hand.filter((c) => c.instanceId !== action.cardInstanceId),
    energy: state.energy - card.cost,
  };

  const ctx: EffectResolutionContext = {
    actingSide: "hero",
    resolvingCardType: card.type,
    resolvingCard: cardInstance,
    ...(action.targetEnemyId !== undefined ? { chosenEnemyId: action.targetEnemyId } : {}),
  };

  let nextState = resolveEffects(stateAfterRemoval, effects, ctx);

  const wasExhausted = nextState.exhaustPile.some((c) => c.instanceId === cardInstance.instanceId);
  if (!wasExhausted) {
    nextState = { ...nextState, discardPile: [...nextState.discardPile, cardInstance] };
  }

  return checkCombatOutcome(nextState);
}
