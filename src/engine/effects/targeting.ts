import type { CombatState, EffectTarget } from "../types";
import type { CombatantRef } from "./combatant-ref";
import type { EffectResolutionContext } from "./context";

/**
 * Résout une cible d'effet en une liste de participants, de façon relative
 * au camp qui agit : `"enemy"`/`"all_enemies"` désignent l'adversaire du
 * camp de `ctx.actingSide` (les ennemis vivants côté héros, le héros côté
 * ennemi) — ce qui permet aux moves ennemis de réutiliser le même mot-clé
 * `"enemy"` que les cartes sans ambiguïté.
 */
export function resolveTargets(
  state: CombatState,
  target: EffectTarget,
  ctx: EffectResolutionContext,
): readonly CombatantRef[] {
  const heroIsActing = ctx.actingSide === "hero";

  if (target === "self") {
    return [ctx.actingSide];
  }

  if (heroIsActing) {
    const aliveEnemies = state.enemies.filter((e) => e.hp > 0);
    if (target === "all_enemies") {
      return aliveEnemies.map((e) => e.instanceId);
    }
    // target === "enemy"
    if (ctx.chosenEnemyId !== undefined && aliveEnemies.some((e) => e.instanceId === ctx.chosenEnemyId)) {
      return [ctx.chosenEnemyId];
    }
    if (aliveEnemies.length === 1) {
      return [(aliveEnemies[0] as (typeof aliveEnemies)[number]).instanceId];
    }
    return [];
  }

  // Un ennemi agit : sa seule cible possible côté adverse est le héros.
  return ["hero"];
}
