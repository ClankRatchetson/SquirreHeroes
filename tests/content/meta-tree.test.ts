import { describe, expect, it } from "vitest";
import { META_TREE, META_TREE_CATALOG } from "../../src/content/meta-tree";
import { CARD_CATALOG } from "../../src/content/cards";
import { metaTreeNodeSchema } from "../../src/content/schemas";

describe("catalogue de l'arbre de Glands d'Or", () => {
  it("contient les 5 nœuds provisoires", () => {
    expect(Object.keys(META_TREE_CATALOG).sort()).toEqual(
      ["pv_max_1", "pv_max_2", "carte_amelioree_carapace", "noisettes_bonus_1", "noisettes_bonus_2"].sort(),
    );
  });

  it("chaque nœud passe la validation Zod", () => {
    for (const node of META_TREE) {
      expect(() => metaTreeNodeSchema.parse(node)).not.toThrow();
    }
  });

  it("chaque prerequisiteId référence un nœud existant du catalogue", () => {
    for (const node of META_TREE) {
      if (node.prerequisiteId) {
        expect(META_TREE_CATALOG[node.prerequisiteId]).toBeDefined();
      }
    }
  });

  /**
   * Vérification croisée volontairement faite ici plutôt que dans le schéma
   * Zod — même précédent anti-cycle que `tests/content/events.test.ts` pour
   * `addCardToDeck.cardId`.
   */
  it("chaque upgradeStartingCard.cardId référence une carte existante avec une variante améliorée", () => {
    for (const node of META_TREE) {
      if (node.effect.kind === "upgradeStartingCard") {
        const card = CARD_CATALOG[node.effect.cardId];
        expect(card).toBeDefined();
        expect(card?.upgraded).toBeDefined();
      }
    }
  });

  /** Garde-fou arithmétique : cf. justification du plan Phase 5 (marge sous le plafond de +20%, 16 points sur une base de 80 PV). */
  it("la somme des bonusMaxHp ne dépasse pas le plafond de +20% de puissance effective de départ", () => {
    const totalBonusMaxHp = META_TREE.filter((n) => n.effect.kind === "bonusMaxHp").reduce(
      (sum, n) => sum + (n.effect.kind === "bonusMaxHp" ? n.effect.amount : 0),
      0,
    );
    expect(totalBonusMaxHp).toBeLessThanOrEqual(16);
  });
});
