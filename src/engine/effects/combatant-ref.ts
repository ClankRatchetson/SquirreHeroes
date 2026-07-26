import type { CombatState, EnemyInstance, HeroState, StatusInstance } from "../types";

/**
 * `"hero"` ou l'`instanceId` d'un ennemi — identifie un participant sans
 * dupliquer les branches héros/ennemi dans chaque handler. C'est une simple
 * chaîne côté typage (un littéral `"hero"` en union avec `string` serait
 * redondant), la valeur sentinelle `"hero"` reste la seule utilisée pour le
 * héros par convention dans tout le moteur.
 */
export type CombatantRef = string;

export interface CombatantView {
  readonly hp: number;
  readonly maxHp: number;
  readonly block: number;
  readonly statuses: readonly StatusInstance[];
}

export function getCombatant(state: CombatState, ref: CombatantRef): CombatantView {
  if (ref === "hero") {
    return state.hero;
  }
  const enemy = state.enemies.find((e) => e.instanceId === ref);
  return enemy ?? { hp: 0, maxHp: 0, block: 0, statuses: [] };
}

export interface CombatantPatch {
  readonly hp?: number;
  readonly block?: number;
  readonly statuses?: readonly StatusInstance[];
}

export function withCombatantPatch(
  state: CombatState,
  ref: CombatantRef,
  patch: CombatantPatch,
): CombatState {
  if (ref === "hero") {
    const hero: HeroState = { ...state.hero, ...patch };
    return { ...state, hero };
  }
  const enemies: readonly EnemyInstance[] = state.enemies.map((e): EnemyInstance =>
    e.instanceId === ref ? { ...e, ...patch } : e,
  );
  return { ...state, enemies };
}
