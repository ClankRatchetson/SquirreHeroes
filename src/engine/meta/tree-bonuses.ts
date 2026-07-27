import type { CardId } from "../types";
import type { AggregatedTreeBonuses, MetaProgression, MetaTreeNode } from "./types";

/** Agrège les effets de tous les nœuds débloqués en bonus concrets, consommables par `createRun`. */
export function aggregateTreeBonuses(meta: MetaProgression, tree: readonly MetaTreeNode[]): AggregatedTreeBonuses {
  const unlocked = tree.filter((n) => meta.unlockedTreeNodeIds.includes(n.id));
  let bonusMaxHp = 0;
  const upgradedStartingCardIds: CardId[] = [];
  let noisettesBonusPerCombat = 0;

  for (const node of unlocked) {
    switch (node.effect.kind) {
      case "bonusMaxHp":
        bonusMaxHp += node.effect.amount;
        break;
      case "upgradeStartingCard":
        upgradedStartingCardIds.push(node.effect.cardId);
        break;
      case "noisettesBonusPerCombat":
        noisettesBonusPerCombat += node.effect.amount;
        break;
    }
  }

  return { bonusMaxHp, upgradedStartingCardIds, noisettesBonusPerCombat };
}
