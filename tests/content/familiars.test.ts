import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import {
  BOURDON_BOURRU,
  FAMILIAR_CATALOG,
  HERISSON_KEVLAR,
  MESANGE_RADAR,
  TAUPE_SECRETE,
} from "../../src/content/familiars";
import { familiarDefinitionSchema } from "../../src/content/schemas";

describe("catalogue de familiers", () => {
  it("contient les 4 familiers de la v1.0", () => {
    expect(Object.keys(FAMILIAR_CATALOG)).toEqual([
      "mesange_radar",
      "herisson_kevlar",
      "bourdon_bourru",
      "taupe_secrete",
    ]);
  });

  it("chaque familier passe la validation Zod", () => {
    for (const familiar of Object.values(FAMILIAR_CATALOG)) {
      expect(() => familiarDefinitionSchema.parse(familiar)).not.toThrow();
    }
  });

  it("la carte signature de chaque familier existe dans le catalogue de cartes et lui appartient", () => {
    for (const familiar of Object.values(FAMILIAR_CATALOG)) {
      const card = CARD_CATALOG[familiar.signatureCardId];
      expect(card).toBeDefined();
      expect(card?.hero).toBe(familiar.id);
    }
  });

  it("Mésange Radar : +1 carte piochée au premier tour", () => {
    expect(MESANGE_RADAR.passive).toEqual({ kind: "bonusDrawFirstTurn", amount: 1 });
  });

  it("Hérisson Kevlar : +3 blocage au premier tour", () => {
    expect(HERISSON_KEVLAR.passive).toEqual({ kind: "bonusBlockFirstTurn", amount: 3 });
  });

  it("Bourdon Bourru : 2 dégâts à un ennemi aléatoire en fin de tour", () => {
    expect(BOURDON_BOURRU.passive).toEqual({ kind: "damageRandomEnemyEndOfTurn", amount: 2 });
  });

  it("Taupe Secrète : +1 énergie tous les 3 tours", () => {
    expect(TAUPE_SECRETE.passive).toEqual({ kind: "bonusEnergyEveryNTurns", amount: 1, everyNTurns: 3 });
  });
});
