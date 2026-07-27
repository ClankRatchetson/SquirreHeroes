import type { Card, RunNode, RunState } from "../types";

export function findNode(state: RunState, nodeId: string): RunNode | undefined {
  return state.map.nodes.find((n) => n.id === nodeId);
}

export interface RunDeckViewEntry {
  readonly runCardId: string;
  readonly card: Card;
  readonly upgraded: boolean;
}

/** Résout chaque entrée du deck de run vers son `Card` de catalogue — ignore silencieusement les entrées orphelines. */
export function getDeckView(state: RunState): readonly RunDeckViewEntry[] {
  return state.deck.flatMap((entry) => {
    const card = state.cardCatalog[entry.cardId];
    return card ? [{ runCardId: entry.runCardId, card, upgraded: entry.upgraded }] : [];
  });
}

/** Nœud(s) atteignables au prochain choix. Avant le premier choix (`currentNodeId === null`), l'unique nœud du floor 0. */
export function getReachableNodeIds(state: RunState): readonly string[] {
  if (state.currentNodeId === null) {
    return state.map.nodes.filter((n) => n.floor === 0).map((n) => n.id);
  }
  return findNode(state, state.currentNodeId)?.edges ?? [];
}

export type NodeStatus = "visite" | "disponible" | "verrouille";

/** Dérivé de `currentNodeId`/`visitedNodeIds` — jamais dupliqué sur `RunNode`. */
export function getNodeStatus(state: RunState, nodeId: string): NodeStatus {
  if (state.visitedNodeIds.includes(nodeId)) {
    return "visite";
  }
  if (getReachableNodeIds(state).includes(nodeId)) {
    return "disponible";
  }
  return "verrouille";
}
