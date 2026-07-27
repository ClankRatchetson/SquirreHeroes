import type { MetaProgression, MetaTreeNode } from "./types";

export function isNodePurchasable(meta: MetaProgression, tree: readonly MetaTreeNode[], nodeId: string): boolean {
  const node = tree.find((n) => n.id === nodeId);
  if (!node) {
    return false;
  }
  if (meta.unlockedTreeNodeIds.includes(nodeId)) {
    return false;
  }
  if (node.prerequisiteId && !meta.unlockedTreeNodeIds.includes(node.prerequisiteId)) {
    return false;
  }
  return meta.glandsDor >= node.cost;
}

/** No-op (référence inchangée) sur toute tentative invalide — même patron défensif que `resolveBuyCard`/`resolveCampfireUpgrade`. */
export function purchaseTreeNode(meta: MetaProgression, tree: readonly MetaTreeNode[], nodeId: string): MetaProgression {
  if (!isNodePurchasable(meta, tree, nodeId)) {
    return meta;
  }
  const node = tree.find((n) => n.id === nodeId) as MetaTreeNode;
  return {
    ...meta,
    glandsDor: meta.glandsDor - node.cost,
    unlockedTreeNodeIds: [...meta.unlockedTreeNodeIds, nodeId],
  };
}
