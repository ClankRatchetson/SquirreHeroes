import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import { cardSchema } from "../../src/content/schemas";

describe("catalogue de cartes", () => {
  it("contient exactement les 51 cartes (15 tranche verticale + 16 Cabriole + 16 Bogue + 4 familiers)", () => {
    expect(Object.keys(CARD_CATALOG)).toHaveLength(51);
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

  it("hero est toujours un héros/familier connu ou neutre", () => {
    const knownOwners = [
      "casse_noix",
      "captain_cabriole",
      "docteur_bogue",
      "mesange_radar",
      "herisson_kevlar",
      "bourdon_bourru",
      "taupe_secrete",
      "neutre",
    ];
    for (const card of Object.values(CARD_CATALOG)) {
      expect(knownOwners).toContain(card.hero);
    }
  });

  it("exactement 16 cartes signature Captain Cabriole", () => {
    const cabrioleCards = Object.values(CARD_CATALOG).filter((c) => c.hero === "captain_cabriole");
    expect(cabrioleCards).toHaveLength(16);
  });

  it("exactement 16 cartes signature Docteur Bogue", () => {
    const bogueCards = Object.values(CARD_CATALOG).filter((c) => c.hero === "docteur_bogue");
    expect(bogueCards).toHaveLength(16);
  });

  it("exactement 1 carte signature par familier (4 au total)", () => {
    const familiarIds = ["mesange_radar", "herisson_kevlar", "bourdon_bourru", "taupe_secrete"];
    for (const familiarId of familiarIds) {
      const cards = Object.values(CARD_CATALOG).filter((c) => c.hero === familiarId);
      expect(cards).toHaveLength(1);
    }
  });

  it("aucune carte de type malédiction dans le contenu de test (volontaire)", () => {
    const maledictions = Object.values(CARD_CATALOG).filter((c) => c.type === "malediction");
    expect(maledictions).toHaveLength(0);
  });
});
