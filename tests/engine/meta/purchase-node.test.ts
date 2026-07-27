import { describe, expect, it } from "vitest";
import { isNodePurchasable, purchaseTreeNode } from "../../../src/engine/meta";
import type { MetaTreeNode } from "../../../src/engine/meta";
import { makeMetaProgression } from "../helpers";

const ROOT_NODE: MetaTreeNode = {
  id: "root",
  nameKey: "test.root.name",
  descriptionKey: "test.root.description",
  cost: 30,
  effect: { kind: "bonusMaxHp", amount: 3 },
};
const CHAINED_NODE: MetaTreeNode = {
  id: "chained",
  nameKey: "test.chained.name",
  descriptionKey: "test.chained.description",
  cost: 60,
  prerequisiteId: "root",
  effect: { kind: "bonusMaxHp", amount: 3 },
};
const TREE: readonly MetaTreeNode[] = [ROOT_NODE, CHAINED_NODE];

describe("isNodePurchasable", () => {
  it("faux si le nœud n'existe pas", () => {
    expect(isNodePurchasable(makeMetaProgression({ glandsDor: 100 }), TREE, "does-not-exist")).toBe(false);
  });

  it("faux si déjà débloqué", () => {
    const meta = makeMetaProgression({ glandsDor: 100, unlockedTreeNodeIds: ["root"] });
    expect(isNodePurchasable(meta, TREE, "root")).toBe(false);
  });

  it("faux si prérequis non satisfait", () => {
    const meta = makeMetaProgression({ glandsDor: 100 });
    expect(isNodePurchasable(meta, TREE, "chained")).toBe(false);
  });

  it("faux si Glands d'Or insuffisants", () => {
    const meta = makeMetaProgression({ glandsDor: 10 });
    expect(isNodePurchasable(meta, TREE, "root")).toBe(false);
  });

  it("vrai si toutes les conditions sont réunies", () => {
    const meta = makeMetaProgression({ glandsDor: 30 });
    expect(isNodePurchasable(meta, TREE, "root")).toBe(true);
  });
});

describe("purchaseTreeNode", () => {
  it("no-op (référence inchangée) sur toute tentative invalide", () => {
    const meta = makeMetaProgression({ glandsDor: 10 });
    expect(purchaseTreeNode(meta, TREE, "root")).toBe(meta);
  });

  it("déduit le coût et ajoute l'id sur un achat valide", () => {
    const meta = makeMetaProgression({ glandsDor: 30 });
    const next = purchaseTreeNode(meta, TREE, "root");
    expect(next.glandsDor).toBe(0);
    expect(next.unlockedTreeNodeIds).toEqual(["root"]);
  });

  it("un nœud chaîné reste bloqué tant que le prérequis n'est pas acheté", () => {
    const meta = makeMetaProgression({ glandsDor: 100 });
    expect(purchaseTreeNode(meta, TREE, "chained")).toBe(meta);
    const afterRoot = purchaseTreeNode(meta, TREE, "root");
    const afterChained = purchaseTreeNode(afterRoot, TREE, "chained");
    expect(afterChained.unlockedTreeNodeIds).toEqual(["root", "chained"]);
    expect(afterChained.glandsDor).toBe(100 - 30 - 60);
  });
});
