import type { CombatState } from "../../engine/types";
import type { CombatDisplayEvent } from "../store/combat-store.types";

function diffCombatant(
  targetId: string,
  prevHp: number,
  nextHp: number,
  prevBlock: number,
  nextBlock: number,
): CombatDisplayEvent[] {
  const events: CombatDisplayEvent[] = [];
  if (nextHp < prevHp) {
    events.push({ id: crypto.randomUUID(), kind: "damage", targetId, amount: prevHp - nextHp });
  } else if (nextHp > prevHp) {
    events.push({ id: crypto.randomUUID(), kind: "heal", targetId, amount: nextHp - prevHp });
  }
  if (nextBlock > prevBlock) {
    events.push({ id: crypto.randomUUID(), kind: "block", targetId, amount: nextBlock - prevBlock });
  }
  return events;
}

/**
 * Compare un état moteur avant/après une action et en dérive une liste
 * d'événements d'affichage (dégât/bloc/soin). Purement cosmétique : ne
 * réinterprète aucune règle de jeu, se contente de lire des deltas déjà
 * produits par `combatReducer`. Les ennemis sont appariés par
 * `instanceId` (pas par index) car un ennemi peut mourir sans disparaître
 * du tableau.
 */
export function diffCombatStates(prev: CombatState, next: CombatState): CombatDisplayEvent[] {
  const events: CombatDisplayEvent[] = diffCombatant(
    "hero",
    prev.hero.hp,
    next.hero.hp,
    prev.hero.block,
    next.hero.block,
  );

  for (const prevEnemy of prev.enemies) {
    const nextEnemy = next.enemies.find((e) => e.instanceId === prevEnemy.instanceId);
    if (!nextEnemy) {
      continue;
    }
    events.push(
      ...diffCombatant(prevEnemy.instanceId, prevEnemy.hp, nextEnemy.hp, prevEnemy.block, nextEnemy.block),
    );
  }

  return events;
}
