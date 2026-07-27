import { isCardPlayable } from "../../engine/core";
import type { Card, CardId, CombatAction, CombatState } from "../../engine/types";

/**
 * IA de combat gloutonne — extraite à l'identique de `scripts/play-combat.ts`
 * et `scripts/play-run.ts` (Phases 1 et 3), réutilisée telle quelle par le
 * harnais de simulation (Phase 6) et par les deux scripts CLI, qui
 * l'importent désormais au lieu de la dupliquer. Priorité : coût
 * décroissant, puis attaque avant défense/compétence à coût égal — évite
 * une politique dégénérée qui ne ferait jamais de dégâts.
 */
export function chooseCombatAction(
  state: CombatState,
  cardCatalog: Readonly<Record<CardId, Card>>,
): CombatAction {
  // Cible tentative fixée AVANT le filtre de jouabilité : une carte
  // d'attaque n'est jouable, avec plusieurs ennemis vivants, que si on lui
  // fournit déjà la cible qu'on compte utiliser.
  const targetEnemyId = state.enemies.find((e) => e.hp > 0)?.instanceId;

  const playable = state.hand.filter((c) => isCardPlayable(state, c.instanceId, targetEnemyId));
  if (playable.length === 0) {
    return { type: "END_TURN" };
  }

  const cardOf = (cardInstanceId: string): Card | undefined => {
    const instance = state.hand.find((c) => c.instanceId === cardInstanceId);
    return instance ? cardCatalog[instance.cardId] : undefined;
  };

  const sorted = [...playable].sort((a, b) => {
    const cardA = cardOf(a.instanceId);
    const cardB = cardOf(b.instanceId);
    const costDiff = (cardB?.cost ?? 0) - (cardA?.cost ?? 0);
    if (costDiff !== 0) {
      return costDiff;
    }
    const attackA = cardA?.type === "attaque" ? 1 : 0;
    const attackB = cardB?.type === "attaque" ? 1 : 0;
    return attackB - attackA;
  });
  const chosen = sorted[0];
  if (!chosen) {
    return { type: "END_TURN" };
  }

  return {
    type: "PLAY_CARD",
    cardInstanceId: chosen.instanceId,
    ...(targetEnemyId !== undefined ? { targetEnemyId } : {}),
  };
}
