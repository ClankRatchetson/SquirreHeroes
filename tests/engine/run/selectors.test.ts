import { describe, expect, it } from "vitest";
import { getDeckView, getNodeStatus, getReachableNodeIds } from "../../../src/engine/run/selectors";
import { makeCard, makeRunNode, makeRunState } from "../helpers";
import type { Card } from "../../../src/engine/types";

describe("getReachableNodeIds", () => {
  it("avant le premier choix (currentNodeId null), renvoie l'unique nœud du floor 0", () => {
    const state = makeRunState({
      currentNodeId: null,
      map: {
        actId: "acte_1",
        floorCount: 2,
        nodes: [
          makeRunNode({ id: "n0", type: "combat", floor: 0, edges: ["n1"] }),
          makeRunNode({ id: "n1", type: "boss", floor: 1 }),
        ],
      },
    });
    expect(getReachableNodeIds(state)).toEqual(["n0"]);
  });

  it("renvoie un tableau vide si le nœud courant est introuvable dans la carte (état incohérent défensif)", () => {
    const state = makeRunState({
      currentNodeId: "ghost",
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [makeRunNode({ id: "n0", type: "combat", floor: 0 })],
      },
    });
    expect(getReachableNodeIds(state)).toEqual([]);
  });

  it("après un choix, renvoie les arêtes du nœud courant", () => {
    const state = makeRunState({
      currentNodeId: "n0",
      map: {
        actId: "acte_1",
        floorCount: 2,
        nodes: [
          makeRunNode({ id: "n0", type: "combat", floor: 0, edges: ["n1", "n2"] }),
          makeRunNode({ id: "n1", type: "boutique", floor: 1 }),
          makeRunNode({ id: "n2", type: "feu_de_camp", floor: 1 }),
        ],
      },
    });
    expect(getReachableNodeIds(state)).toEqual(["n1", "n2"]);
  });
});

describe("getNodeStatus", () => {
  const state = makeRunState({
    currentNodeId: "n0",
    visitedNodeIds: ["n0"],
    map: {
      actId: "acte_1",
      floorCount: 2,
      nodes: [
        makeRunNode({ id: "n0", type: "combat", floor: 0, edges: ["n1", "n2"] }),
        makeRunNode({ id: "n1", type: "boutique", floor: 1 }),
        makeRunNode({ id: "n2", type: "feu_de_camp", floor: 1 }),
        makeRunNode({ id: "n3", type: "boss", floor: 2 }),
      ],
    },
  });

  it("visité", () => {
    expect(getNodeStatus(state, "n0")).toBe("visite");
  });

  it("disponible", () => {
    expect(getNodeStatus(state, "n1")).toBe("disponible");
  });

  it("verrouillé", () => {
    expect(getNodeStatus(state, "n3")).toBe("verrouille");
  });
});

describe("getDeckView", () => {
  const strike: Card = makeCard({ id: "strike" });

  it("résout chaque entrée du deck vers son Card de catalogue", () => {
    const state = makeRunState({
      cardCatalog: { strike },
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: true }],
    });
    const view = getDeckView(state);
    expect(view).toHaveLength(1);
    expect(view[0]?.card).toBe(strike);
    expect(view[0]?.upgraded).toBe(true);
  });

  it("ignore silencieusement une entrée orpheline (cardId absent du catalogue)", () => {
    const state = makeRunState({
      cardCatalog: {},
      deck: [{ runCardId: "rc-0", cardId: "ghost", upgraded: false }],
    });
    expect(getDeckView(state)).toEqual([]);
  });
});
