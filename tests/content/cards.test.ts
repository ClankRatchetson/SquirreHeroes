import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import { cardSchema } from "../../src/content/schemas";

describe("catalogue de cartes", () => {
  it("contient exactement les 70 cartes cibles de la v1.0 (48 signature + 18 neutres + 4 familiers)", () => {
    expect(Object.keys(CARD_CATALOG)).toHaveLength(70);
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

  it("exactement 16 cartes signature par héros (Casse-Noix, Captain Cabriole, Docteur Bogue)", () => {
    const heroIds = ["casse_noix", "captain_cabriole", "docteur_bogue"];
    for (const heroId of heroIds) {
      const heroCards = Object.values(CARD_CATALOG).filter((c) => c.hero === heroId);
      expect(heroCards).toHaveLength(16);
    }
  });

  it("chaque héros a la répartition de rareté cible 9 commune / 5 rare / 2 légendaire", () => {
    const heroIds = ["casse_noix", "captain_cabriole", "docteur_bogue"];
    for (const heroId of heroIds) {
      const heroCards = Object.values(CARD_CATALOG).filter((c) => c.hero === heroId);
      expect(heroCards.filter((c) => c.rarity === "commune")).toHaveLength(9);
      expect(heroCards.filter((c) => c.rarity === "rare")).toHaveLength(5);
      expect(heroCards.filter((c) => c.rarity === "legendaire")).toHaveLength(2);
    }
  });

  it("exactement 18 cartes neutres, réparties 10 commune / 6 rare / 2 légendaire", () => {
    const neutralCards = Object.values(CARD_CATALOG).filter((c) => c.hero === "neutre");
    expect(neutralCards).toHaveLength(18);
    expect(neutralCards.filter((c) => c.rarity === "commune")).toHaveLength(10);
    expect(neutralCards.filter((c) => c.rarity === "rare")).toHaveLength(6);
    expect(neutralCards.filter((c) => c.rarity === "legendaire")).toHaveLength(2);
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
