import type { CombatState } from "../../engine/types";
import type { CombatDisplayEvent } from "../store/combat-store.types";
import { diffCombatStates } from "./diff-events";
import { ENEMY_TURN_STEP_MS } from "./timing";

/**
 * Étale la PRÉSENTATION des événements d'un tour ennemi déjà résolu en un
 * seul appel de `combatReducer` (`prev` → `next`) : l'état moteur affiché
 * est immédiatement `next`, seuls les flashs sont décalés dans le temps via
 * `setTimeout`, jamais un second appel au réducteur. Partagée entre
 * `combat-store.ts` (mode démo) et `run-store.ts` (mode run) pour éviter de
 * dupliquer cette logique de présentation.
 */
export function staggerEnemyTurnPresentation(
  prev: CombatState,
  next: CombatState,
  pushEvents: (events: readonly CombatDisplayEvent[]) => void,
  setResolving: (resolving: boolean) => void,
): void {
  const events = diffCombatStates(prev, next);
  const heroEvents = events.filter((e) => e.targetId === "hero");
  const enemyEventGroups = next.enemies.map((enemy) => events.filter((e) => e.targetId === enemy.instanceId));

  enemyEventGroups.forEach((group, index) => {
    if (group.length === 0) {
      return;
    }
    setTimeout(() => {
      pushEvents(group);
    }, index * ENEMY_TURN_STEP_MS);
  });

  setTimeout(
    () => {
      if (heroEvents.length > 0) {
        pushEvents(heroEvents);
      }
      setResolving(false);
    },
    next.enemies.length * ENEMY_TURN_STEP_MS,
  );
}
