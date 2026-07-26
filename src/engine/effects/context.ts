import type { CardInstance, CardType } from "../types";
import type { CombatantRef } from "./combatant-ref";

export interface EffectResolutionContext {
  /** `"hero"` ou l'`instanceId` de l'ennemi qui agit. */
  readonly actingSide: CombatantRef;
  /** Ennemi choisi par le joueur, si la carte a besoin d'une cible unique. */
  readonly chosenEnemyId?: string;
  /** Présent uniquement quand on résout les effets d'une carte jouée (pour Leste). */
  readonly resolvingCardType?: CardType;
  /** Carte en cours de résolution, déjà retirée de la main (pour l'exhaust). */
  readonly resolvingCard?: CardInstance;
}
