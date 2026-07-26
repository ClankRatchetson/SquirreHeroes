import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import { cardSchema } from "../../src/content/schemas";

describe("catalogue de cartes", () => {
  it("contient exactement les 15 cartes de la tranche verticale", () => {
    expect(Object.keys(CARD_CATALOG)).toHaveLength(15);
  });

  it("chaque carte passe la validation Zod", () => {
    for (const card of Object.values(CARD_CATALOG)) {
      expect(() => cardSchema.parse(card)).not.toThrow();
    }
  });

  it("la clé du catalogue correspond à l'id de la carte", () => {
    for (const [key, card] of Object.entries(CARD_CATALOG)) {
      expect(card.id).toBe(key);
    }
  });

  it("aucun coût négatif", () => {
    for (const card of Object.values(CARD_CATALOG)) {
      expect(card.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it("hero est toujours casse_noix ou neutre", () => {
    for (const card of Object.values(CARD_CATALOG)) {
      expect(["casse_noix", "neutre"]).toContain(card.hero);
    }
  });

  it("aucune carte de type malédiction dans le contenu de test (volontaire)", () => {
    const maledictions = Object.values(CARD_CATALOG).filter((c) => c.type === "malediction");
    expect(maledictions).toHaveLength(0);
  });
});
