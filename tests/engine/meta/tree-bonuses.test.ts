import { describe, expect, it } from "vitest";
import { aggregateTreeBonuses } from "../../../src/engine/meta";
import type { MetaTreeNode } from "../../../src/engine/meta";
import { makeMetaProgression } from "../helpers";

const TREE: readonly MetaTreeNode[] = [
  { id: "hp1", nameKey: "test.hp1.name", descriptionKey: "test.hp1.description", cost: 30, effect: { kind: "bonusMaxHp", amount: 3 } },
  { id: "hp2", nameKey: "test.hp2.name", descriptionKey: "test.hp2.description", cost: 60, effect: { kind: "bonusMaxHp", amount: 3 } },
  {
    id: "card1",
    nameKey: "test.card1.name",
    descriptionKey: "test.card1.description",
    cost: 50,
    effect: { kind: "upgradeStartingCard", cardId: "carapace_de_granit" },
  },
  {
    id: "noisette1",
    nameKey: "test.noisette1.name",
    descriptionKey: "test.noisette1.description",
    cost: 25,
    effect: { kind: "noisettesBonusPerCombat", amount: 1 },
  },
];

describe("aggregateTreeBonuses", () => {
  it("aucun nœud débloqué -> tous les bonus à zéro", () => {
    const meta = makeMetaProgression({ unlockedTreeNodeIds: [] });
    expect(aggregateTreeBonuses(meta, TREE)).toEqual({
      bonusMaxHp: 0,
      upgradedStartingCardIds: [],
      noisettesBonusPerCombat: 0,
    });
  });

  it("plusieurs nœuds bonusMaxHp/noisettesBonusPerCombat s'additionnent", () => {
    const meta = makeMetaProgression({ unlockedTreeNodeIds: ["hp1", "hp2", "noisette1"] });
    const bonuses = aggregateTreeBonuses(meta, TREE);
    expect(bonuses.bonusMaxHp).toBe(6);
    expect(bonuses.noisettesBonusPerCombat).toBe(1);
  });

  it("les nœuds upgradeStartingCard sont collectés dans un tableau", () => {
    const meta = makeMetaProgression({ unlockedTreeNodeIds: ["card1"] });
    expect(aggregateTreeBonuses(meta, TREE).upgradedStartingCardIds).toEqual(["carapace_de_granit"]);
  });
});
