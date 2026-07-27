import type { CombatState, EnemyInstance } from "../types";
import {
  applyEndOfTurnFamiliarDamage,
  resolveEffects,
  tickEndOfTurnStatuses,
  type EffectResolutionContext,
} from "../effects";
import { checkCombatOutcome } from "./outcome";
import { startHeroTurn } from "./start-hero-turn";

function incrementMovesTaken(state: CombatState, instanceId: string): CombatState {
  const enemies: readonly EnemyInstance[] = state.enemies.map((e) =>
    e.instanceId === instanceId ? { ...e, movesTaken: e.movesTaken + 1 } : e,
  );
  return { ...state, enemies };
}

function isAlive(state: CombatState, instanceId: string): boolean {
  const enemy = state.enemies.find((e) => e.instanceId === instanceId);
  return enemy !== undefined && enemy.hp > 0;
}

/**
 * Tick statuts héros → défausse complète de la main → pour chaque ennemi
 * vivant, dans l'ordre : résolution de son intention puis tick de ses
 * propres statuts décrémentants. Arrêt anticipé dès que le combat se
 * termine. Si le combat continue, enchaîne sur `startHeroTurn`.
 */
export function resolveEndTurn(state: CombatState): CombatState {
  let current = tickEndOfTurnStatuses(state, "hero");
  current = checkCombatOutcome(current);
  if (current.outcome !== "en_cours") {
    return current;
  }

  current = { ...current, discardPile: [...current.discardPile, ...current.hand], hand: [] };

  current = applyEndOfTurnFamiliarDamage(current);
  current = checkCombatOutcome(current);
  if (current.outcome !== "en_cours") {
    return current;
  }

  for (const enemy of current.enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const ctx: EffectResolutionContext = { actingSide: enemy.instanceId };
    current = resolveEffects(current, enemy.intent.effects, ctx);
    current = incrementMovesTaken(current, enemy.instanceId);
    current = checkCombatOutcome(current);
    if (current.outcome !== "en_cours") {
      return current;
    }

    if (isAlive(current, enemy.instanceId)) {
      current = tickEndOfTurnStatuses(current, enemy.instanceId);
      current = checkCombatOutcome(current);
      if (current.outcome !== "en_cours") {
        return current;
      }
    }
  }

  return startHeroTurn(current);
}
