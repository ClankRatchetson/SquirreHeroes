import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import {
  CAPTAIN_CABRIOLE,
  CASSE_NOIX,
  DOCTEUR_BOGUE,
  HERO_CATALOG,
} from "../../src/content/heroes";
import { heroDefinitionSchema } from "../../src/content/schemas";

describe("catalogue de héros", () => {
  it("contient Casse-Noix, Captain Cabriole et Docteur Bogue", () => {
    expect(Object.keys(HERO_CATALOG)).toEqual([
      "casse_noix",
      "captain_cabriole",
      "docteur_bogue",
    ]);
  });

  it("Casse-Noix passe la validation Zod", () => {
    expect(() => heroDefinitionSchema.parse(CASSE_NOIX)).not.toThrow();
  });

  it("le deck de départ de Casse-Noix compte 10 cartes, toutes présentes dans le catalogue de cartes", () => {
    expect(CASSE_NOIX.startingDeck).toHaveLength(10);
    for (const cardId of CASSE_NOIX.startingDeck) {
      expect(CARD_CATALOG[cardId]).toBeDefined();
    }
  });

  it("Captain Cabriole passe la validation Zod", () => {
    expect(() => heroDefinitionSchema.parse(CAPTAIN_CABRIOLE)).not.toThrow();
  });

  it("le deck de départ de Captain Cabriole compte 10 cartes, toutes présentes dans le catalogue de cartes", () => {
    expect(CAPTAIN_CABRIOLE.startingDeck).toHaveLength(10);
    for (const cardId of CAPTAIN_CABRIOLE.startingDeck) {
      expect(CARD_CATALOG[cardId]).toBeDefined();
    }
  });

  it("chaque carte du deck de départ de Captain Cabriole lui appartient (jamais une carte d'un autre héros)", () => {
    for (const cardId of CAPTAIN_CABRIOLE.startingDeck) {
      const card = CARD_CATALOG[cardId];
      expect(card?.hero).toBe("captain_cabriole");
    }
  });

  it("Docteur Bogue passe la validation Zod", () => {
    expect(() => heroDefinitionSchema.parse(DOCTEUR_BOGUE)).not.toThrow();
  });

  it("le deck de départ de Docteur Bogue compte 10 cartes, toutes présentes dans le catalogue de cartes", () => {
    expect(DOCTEUR_BOGUE.startingDeck).toHaveLength(10);
    for (const cardId of DOCTEUR_BOGUE.startingDeck) {
      expect(CARD_CATALOG[cardId]).toBeDefined();
    }
  });

  it("chaque carte du deck de départ de Docteur Bogue lui appartient (jamais une carte d'un autre héros)", () => {
    for (const cardId of DOCTEUR_BOGUE.startingDeck) {
      const card = CARD_CATALOG[cardId];
      expect(card?.hero).toBe("docteur_bogue");
    }
  });
});
