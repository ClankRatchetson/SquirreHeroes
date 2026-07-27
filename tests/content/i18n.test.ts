import { describe, expect, it } from "vitest";
import { fr } from "../../src/content/i18n/fr";
import { t, tFromContent } from "../../src/content/i18n/t";
import { CARD_CATALOG } from "../../src/content/cards";
import { ENEMY_CATALOG } from "../../src/content/enemies";
import { HERO_CATALOG } from "../../src/content/heroes";
import { EVENT_CATALOG } from "../../src/content/events";
import { META_TREE } from "../../src/content/meta-tree";

describe("i18n dictionary", () => {
  it("resolves every declared key to a non-empty string", () => {
    for (const key of Object.keys(fr) as Array<keyof typeof fr>) {
      expect(t(key)).toBe(fr[key]);
      expect(t(key).length).toBeGreaterThan(0);
    }
  });
});

describe("clés i18n référencées par le contenu", () => {
  it("chaque nameKey/flavorKey de carte (et son upgraded) résout vers une chaîne non vide", () => {
    for (const card of Object.values(CARD_CATALOG)) {
      expect(tFromContent(card.nameKey).length).toBeGreaterThan(0);
      if (card.flavorKey) {
        expect(tFromContent(card.flavorKey).length).toBeGreaterThan(0);
      }
      if (card.upgraded) {
        expect(tFromContent(card.upgraded.nameKey).length).toBeGreaterThan(0);
      }
    }
  });

  it("chaque nameKey d'ennemi et de move résout vers une chaîne non vide", () => {
    for (const enemy of Object.values(ENEMY_CATALOG)) {
      expect(tFromContent(enemy.nameKey).length).toBeGreaterThan(0);
      for (const move of enemy.moves) {
        expect(tFromContent(move.nameKey).length).toBeGreaterThan(0);
      }
    }
  });

  it("chaque nameKey de héros résout vers une chaîne non vide", () => {
    for (const hero of Object.values(HERO_CATALOG)) {
      expect(tFromContent(hero.nameKey).length).toBeGreaterThan(0);
    }
  });

  it("chaque titleKey/textKey/labelKey d'événement résout vers une chaîne non vide", () => {
    for (const event of Object.values(EVENT_CATALOG)) {
      expect(tFromContent(event.titleKey).length).toBeGreaterThan(0);
      expect(tFromContent(event.textKey).length).toBeGreaterThan(0);
      for (const choice of event.choices) {
        expect(tFromContent(choice.labelKey).length).toBeGreaterThan(0);
      }
    }
  });

  it("chaque nameKey/descriptionKey de nœud de l'arbre de Glands d'Or résout vers une chaîne non vide", () => {
    for (const node of META_TREE) {
      expect(tFromContent(node.nameKey).length).toBeGreaterThan(0);
      expect(tFromContent(node.descriptionKey).length).toBeGreaterThan(0);
    }
  });
});
