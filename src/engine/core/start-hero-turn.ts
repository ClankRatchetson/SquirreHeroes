import type { CombatState, EnemyInstance, HeroState } from "../types";
import { applyDrawEffect } from "../effects";
import { decideNextIntent } from "./enemy-intent";
import { HAND_SIZE } from "./constants";

/**
 * Reset énergie/blocage (sauf `retainsBlock`), pioche jusqu'à `HAND_SIZE`
 * (remélange la défausse si besoin via `applyDrawEffect`), fige les
 * intentions de chaque ennemi vivant pour ce cycle.
 */
export function startHeroTurn(state: CombatState): CombatState {
  const hero: HeroState = {
    ...state.hero,
    block: state.hero.retainsBlock ? state.hero.block : 0,
  };

  let current: CombatState = {
    ...state,
    hero,
    energy: state.maxEnergy,
    turnNumber: state.turnNumber + 1,
  };

  const cardsToDraw = Math.max(0, HAND_SIZE - current.hand.length);
  current = applyDrawEffect(current, { kind: "draw", amount: cardsToDraw });

  let rng = current.rng;
  const enemies: EnemyInstance[] = current.enemies.map((enemy) => {
    if (enemy.hp <= 0) {
      return enemy;
    }
    const [intent, nextRng] = decideNextIntent(enemy, rng);
    rng = nextRng;
    return { ...enemy, intent };
  });

  return { ...current, enemies, rng };
}
