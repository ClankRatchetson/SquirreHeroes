import type { CombatState, EnemyInstance } from "../types";
import { nextInt } from "../rng";
import { applyDrawEffect } from "./resource-effects";
import { computeIncomingDamage } from "./status-math";
import { getCombatant, withCombatantPatch } from "./combatant-ref";

/**
 * Passifs de familier (§3.3 des specs) : le familier n'est jamais une unité
 * ciblable, donc ces 3 hooks se déclenchent automatiquement à des moments
 * précis du cycle de combat plutôt que via `resolveEffects` (réservé aux
 * cartes/moves ennemis). `state.familiarPassive` est figé pour tout le
 * combat (cf. `CombatState`).
 */

/** Appelé en toute fin de `createCombat` — le tour 1 ne passe jamais par `startHeroTurn`. */
export function applyFirstTurnFamiliarBonus(state: CombatState): CombatState {
  const passive = state.familiarPassive;
  if (!passive) {
    return state;
  }
  if (passive.kind === "bonusDrawFirstTurn") {
    return applyDrawEffect(state, { kind: "draw", amount: passive.amount });
  }
  if (passive.kind === "bonusBlockFirstTurn") {
    return { ...state, hero: { ...state.hero, block: state.hero.block + passive.amount } };
  }
  return state;
}

/** Appelé dans `startHeroTurn`, après l'incrément de `turnNumber` — jamais déclenché pour le tour 1. */
export function applyPeriodicFamiliarEnergyBonus(state: CombatState): CombatState {
  const passive = state.familiarPassive;
  if (!passive || passive.kind !== "bonusEnergyEveryNTurns") {
    return state;
  }
  if (state.turnNumber % passive.everyNTurns !== 0) {
    return state;
  }
  return { ...state, energy: state.energy + passive.amount };
}

/**
 * Appelé dans `resolveEndTurn`, après la défausse de la main. Dégâts plats
 * qui respectent le blocage/les statuts défensifs de la cible, mais
 * n'appliquent jamais de bonus d'attaquant (Force) ni de riposte Piquants :
 * le familier n'est pas un combattant, il n'a ni statuts ni référence
 * ciblable pour une riposte (§3.3 — choix délibéré pour garder le moteur
 * simple).
 */
export function applyEndOfTurnFamiliarDamage(state: CombatState): CombatState {
  const passive = state.familiarPassive;
  if (!passive || passive.kind !== "damageRandomEnemyEndOfTurn") {
    return state;
  }
  const aliveEnemies = state.enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 0) {
    return state;
  }
  const [index, nextRng] = nextInt(state.rng, aliveEnemies.length);
  const target = aliveEnemies[index] as EnemyInstance;
  const defender = getCombatant(state, target.instanceId);
  const { damageToHp, remainingBlock } = computeIncomingDamage(passive.amount, defender.statuses, defender.block);
  const patched = withCombatantPatch(state, target.instanceId, {
    hp: Math.max(0, defender.hp - damageToHp),
    block: remainingBlock,
  });
  return { ...patched, rng: nextRng };
}
