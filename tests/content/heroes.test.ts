import { describe, expect, it } from "vitest";
import { CARD_CATALOG } from "../../src/content/cards";
import { CASSE_NOIX, HERO_CATALOG } from "../../src/content/heroes";
import { heroDefinitionSchema } from "../../src/content/schemas";

describe("catalogue de héros", () => {
  it("contient Casse-Noix", () => {
    expect(Object.keys(HERO_CATALOG)).toEqual(["casse_noix"]);
  });

  it("Casse-Noix passe la validation Zod", () => {
    expect(() => heroDefinitionSchema.parse(CASSE_NOIX)).not.toThrow();
  });

  it("le deck de départ compte 10 cartes, toutes présentes dans le catalogue de cartes", () => {
    expect(CASSE_NOIX.startingDeck).toHaveLength(10);
    for (const cardId of CASSE_NOIX.startingDeck) {
      expect(CARD_CATALOG[cardId]).toBeDefined();
    }
  });
});
