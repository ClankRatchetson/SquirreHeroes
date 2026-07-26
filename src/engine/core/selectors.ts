import type { Card, CardInstance, CombatState, EnemyMoveDef, TranslationKey } from "../types";

export interface VisibleEnemyIntent {
  readonly enemyInstanceId: string;
  readonly nameKey: TranslationKey;
  readonly move: EnemyMoveDef;
}

/** Lit `enemy.intent` (figée par `startHeroTurn`/`createCombat`), ne recalcule jamais. */
export function getVisibleEnemyIntents(state: CombatState): readonly VisibleEnemyIntent[] {
  return state.enemies
    .filter((e) => e.hp > 0)
    .map((e) => ({ enemyInstanceId: e.instanceId, nameKey: e.nameKey, move: e.intent }));
}

export interface HandEntry {
  readonly instance: CardInstance;
  readonly card: Card;
}

export function getHandView(state: CombatState): readonly HandEntry[] {
  return state.hand.flatMap((instance) => {
    const card = state.cardCatalog[instance.cardId];
    return card ? [{ instance, card }] : [];
  });
}

export function getEnergy(state: CombatState): { readonly current: number; readonly max: number } {
  return { current: state.energy, max: state.maxEnergy };
}
