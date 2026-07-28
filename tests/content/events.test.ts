import { describe, expect, it } from "vitest";
import { EVENT_CATALOG } from "../../src/content/events";
import { CARD_CATALOG } from "../../src/content/cards";
import { eventDefinitionSchema } from "../../src/content/schemas";

describe("catalogue d'événements", () => {
  it("contient les 15 événements cibles de la v1.0", () => {
    expect(Object.keys(EVENT_CATALOG).sort()).toEqual(
      [
        "noyer_ancestral",
        "fontaine_moussue",
        "marchand_ambulant",
        "ruisseau_gele",
        "cachette_de_provisions",
        "etabli_abandonne",
        "vieux_blaireau_sage",
        "ruche_abandonnee",
        "concours_de_glands",
        "cabane_a_outils",
        "nid_abandonne",
        "guerisseuse_itinerante",
        "vieux_piege_rouille",
        "clairiere_silencieuse",
        "terrier_encombre",
      ].sort(),
    );
  });

  it("chaque événement passe la validation Zod", () => {
    for (const event of Object.values(EVENT_CATALOG)) {
      expect(() => eventDefinitionSchema.parse(event)).not.toThrow();
    }
  });

  it("chaque événement propose entre 2 et 4 choix", () => {
    for (const event of Object.values(EVENT_CATALOG)) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.choices.length).toBeLessThanOrEqual(4);
    }
  });

  /**
   * Vérification croisée volontairement faite ici plutôt que dans le schéma
   * Zod (`event.schema.ts`) : un import de `CARD_CATALOG` depuis le schéma
   * créerait un cycle d'import (`content/cards` → `content/schemas` (barrel)
   * → `event.schema.ts` → `content/cards`). Même précédent que la
   * vérification `HeroDefinition.startingDeck` dans `tests/content/heroes.test.ts`.
   */
  it("chaque addCardToDeck.cardId référence une carte existante du catalogue", () => {
    for (const event of Object.values(EVENT_CATALOG)) {
      for (const choice of event.choices) {
        for (const effect of choice.effects) {
          if (effect.kind === "addCardToDeck") {
            expect(CARD_CATALOG[effect.cardId]).toBeDefined();
          }
        }
      }
    }
  });
});
