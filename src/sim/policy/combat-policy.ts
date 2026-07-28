import { getVisibleEnemyIntents, isCardPlayable } from "../../engine/core";
import type { Card, CardId, CombatAction, CombatState } from "../../engine/types";

/**
 * Somme les dégâts bruts que les intentions ennemies VISIBLES infligeraient
 * ce tour (`damage`/`damageAll`/`multiHit`), en ignorant les formules de
 * statut (Force/Étourdi/etc. côté attaquant, déjà appliquées au moment où
 * `computeIncomingDamage` s'exécutera réellement) — une estimation grossière
 * mais suffisante pour décider "dois-je bloquer ce tour", pas un calcul de
 * dégâts exact.
 */
function estimateIncomingDamage(state: CombatState): number {
  let total = 0;
  for (const { move } of getVisibleEnemyIntents(state)) {
    for (const effect of move.effects) {
      if (effect.kind === "damage" || effect.kind === "damageAll") {
        total += effect.amount;
      } else if (effect.kind === "multiHit") {
        total += effect.hits * effect.amountPerHit;
      }
    }
  }
  return total;
}

/**
 * IA de combat gloutonne — extraite à l'identique de `scripts/play-combat.ts`
 * et `scripts/play-run.ts` (Phases 1 et 3), réutilisée telle quelle par le
 * harnais de simulation (Phase 6) et par les deux scripts CLI, qui
 * l'importent désormais au lieu de la dupliquer. Priorité : coût
 * décroissant, puis attaque avant défense/compétence à coût égal — évite
 * une politique dégénérée qui ne ferait jamais de dégâts.
 *
 * Ajout (équilibrage post-Phase 7, contenu complet) : diagnostic mené via
 * le harnais (voir CHANGELOG) — la politique précédente ne bloquait
 * quasiment jamais (l'attaque l'emportait systématiquement à coût égal),
 * ce qui écrasait le taux de victoire des boss (~7% de réussite) sans que
 * ça reflète un déséquilibre réel du contenu. Reste gloutonne et
 * déterministe, juste moins suicidaire : si les dégâts entrants estimés ce
 * tour dépassent le blocage déjà posé, la défense passe devant l'attaque
 * dans le tri (à coût égal comme à coût différent), sinon le comportement
 * d'origine est inchangé.
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

  const needsBlock = estimateIncomingDamage(state) > state.hero.block;

  const sorted = [...playable].sort((a, b) => {
    const cardA = cardOf(a.instanceId);
    const cardB = cardOf(b.instanceId);
    if (needsBlock) {
      const defenseA = cardA?.type === "defense" ? 1 : 0;
      const defenseB = cardB?.type === "defense" ? 1 : 0;
      if (defenseA !== defenseB) {
        return defenseB - defenseA;
      }
    }
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
