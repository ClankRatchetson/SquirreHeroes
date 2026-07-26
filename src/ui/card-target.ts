import { isCardPlayable, needsSingleEnemyTarget } from "../engine/core";
import type { Card, CardInstance, CombatState, EffectSpec } from "../engine/types";

/** Résout les effets actifs d'une carte (base ou améliorée) — même logique que `resolve-play-card.ts`. */
export function activeEffectsOf(card: Card, upgraded: boolean): readonly EffectSpec[] {
  return upgraded && card.upgraded ? card.upgraded.effects : card.effects;
}

/**
 * Réutilise `needsSingleEnemyTarget` exporté par le moteur (voir
 * `src/engine/core/resolve-play-card.ts`) plutôt que d'en dupliquer une
 * copie côté UI — évite tout risque de divergence si le moteur évolue.
 */
export function cardNeedsEnemyTarget(card: Card, upgraded: boolean): boolean {
  return needsSingleEnemyTarget(activeEffectsOf(card, upgraded));
}

/**
 * Jouabilité "avant tout geste", pour l'affichage (opacité désactivée,
 * autoriser le tap/drag) : sans cible requise, délègue directement à
 * `isCardPlayable` ; avec cible requise et un seul ennemi vivant, fixe la
 * cible tentative avant l'appel (même pattern que `scripts/play-combat.ts`) ;
 * avec plusieurs ennemis vivants, la carte est "jouable en principe" si
 * elle l'est pour au moins un candidat (le choix se fait ensuite via le
 * mode ciblage/drag).
 */
export function isCardVisuallyPlayable(state: CombatState, instance: CardInstance, card: Card): boolean {
  const needsTarget = cardNeedsEnemyTarget(card, instance.upgraded);
  if (!needsTarget) {
    return isCardPlayable(state, instance.instanceId);
  }
  const aliveEnemies = state.enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 1) {
    const only = aliveEnemies[0];
    return only !== undefined && isCardPlayable(state, instance.instanceId, only.instanceId);
  }
  return aliveEnemies.some((e) => isCardPlayable(state, instance.instanceId, e.instanceId));
}
