import { describe, expect, it } from "vitest";
import { resolveChoisirNoeud } from "../../../src/engine/run/enter-node";
import { makeCard, makeRunNode, makeRunState } from "../helpers";
import type { Card, EnemyDefinition } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike", cost: 1, effects: [{ kind: "damage", target: "enemy", amount: 5 }] });
const CATALOG: Readonly<Record<string, Card>> = { strike };

const dummy: EnemyDefinition = {
  id: "dummy",
  nameKey: "test.enemy",
  maxHp: 20,
  moves: [{ id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 3 }] }],
  pattern: ["hit"],
};
const ENEMY_CATALOG: Readonly<Record<string, EnemyDefinition>> = { dummy };

function baseState() {
  return makeRunState({
    currentNodeId: null,
    heroHp: 60,
    deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
    cardCatalog: CATALOG,
    enemyCatalog: ENEMY_CATALOG,
    map: {
      actId: "acte_1",
      floorCount: 4,
      nodes: [
        makeRunNode({ id: "combat0", type: "combat", floor: 0, enemyIds: ["dummy"], edges: ["shop1"] }),
        makeRunNode({ id: "shop1", type: "boutique", floor: 1, edges: ["camp2"] }),
        makeRunNode({ id: "camp2", type: "feu_de_camp", floor: 2, edges: ["event3"] }),
        makeRunNode({ id: "event3", type: "evenement", floor: 3, eventId: "an_event", edges: [] }),
      ],
    },
  });
}

describe("resolveChoisirNoeud", () => {
  it("no-op hors phase carte", () => {
    const state = { ...baseState(), phase: "combat" as const };
    expect(resolveChoisirNoeud(state, "combat0")).toBe(state);
  });

  it("no-op si le nœud n'est pas atteignable", () => {
    const state = baseState();
    expect(resolveChoisirNoeud(state, "shop1")).toBe(state);
  });

  it("no-op si le nœud atteignable référence un id absent de la carte (état incohérent défensif)", () => {
    const state = makeRunState({
      currentNodeId: null,
      cardCatalog: CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [makeRunNode({ id: "n0", type: "combat", floor: 0, enemyIds: ["dummy"], edges: ["ghost"] })],
      },
    });
    // "ghost" est atteignable au sens de getReachableNodeIds (arête déclarée) mais n'existe pas comme RunNode.
    const contrived = { ...state, currentNodeId: "n0", visitedNodeIds: ["n0"] };
    expect(resolveChoisirNoeud(contrived, "ghost")).toBe(contrived);
  });

  it("nœud combat : crée pendingCombat avec le deck/PV du run, passe en phase combat", () => {
    const state = baseState();
    const next = resolveChoisirNoeud(state, "combat0");
    expect(next.phase).toBe("combat");
    expect(next.currentNodeId).toBe("combat0");
    expect(next.visitedNodeIds).toEqual(["combat0"]);
    expect(next.pendingCombat).not.toBeNull();
    expect(next.pendingCombat?.hero.hp).toBe(60);
    expect(next.pendingCombat?.enemies).toHaveLength(1);
    const allCards = [...(next.pendingCombat?.hand ?? []), ...(next.pendingCombat?.drawPile ?? [])];
    expect(allCards).toHaveLength(1);
    expect(allCards[0]?.cardId).toBe("strike");
  });

  it("nœud boutique : génère pendingShop, passe en phase boutique", () => {
    const state = { ...baseState(), currentNodeId: "combat0", visitedNodeIds: ["combat0"] };
    const next = resolveChoisirNoeud(state, "shop1");
    expect(next.phase).toBe("boutique");
    expect(next.pendingShop).not.toBeNull();
  });

  it("nœud feu de camp : passe en phase feu_de_camp sans générer d'offre", () => {
    const state = { ...baseState(), currentNodeId: "shop1", visitedNodeIds: ["combat0", "shop1"] };
    const next = resolveChoisirNoeud(state, "camp2");
    expect(next.phase).toBe("feu_de_camp");
  });

  it("nœud événement : fixe pendingEventId, passe en phase evenement", () => {
    const state = { ...baseState(), currentNodeId: "camp2", visitedNodeIds: ["combat0", "shop1", "camp2"] };
    const next = resolveChoisirNoeud(state, "event3");
    expect(next.phase).toBe("evenement");
    expect(next.pendingEventId).toBe("an_event");
  });
});
