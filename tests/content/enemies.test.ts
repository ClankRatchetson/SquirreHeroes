import { describe, expect, it } from "vitest";
import {
  BARON_GRIFFU,
  BARONNE_BEC_DE_FER,
  BELETTE_BRAQUEUSE,
  CAMPAGNOL_CAGOULE,
  CHOUETTE_GUETTEUSE,
  CORVIDE_MASQUE,
  ENEMY_CATALOG,
  FOUINE_FATALE,
  GRAND_LOUP_HURLEUR,
  GRIFFEUR_DE_GOUTTIERE,
  LYNX_SOLITAIRE,
  MERLE_MERCENAIRE,
  MULOT_MASQUE,
  PIE_KLEPTOMANE,
  PUTOIS_FOURBE,
  RENARDEAU_CHAPARDEUR,
} from "../../src/content/enemies";
import { enemyDefinitionSchema } from "../../src/content/schemas";

describe("catalogue d'ennemis", () => {
  it("contient le roster complet des Actes I, II et III : 3×(3 communs + 1 élite + 1 boss)", () => {
    expect(Object.keys(ENEMY_CATALOG).sort()).toEqual(
      [
        "campagnol_cagoule",
        "mulot_masque",
        "pie_kleptomane",
        "merle_mercenaire",
        "baronne_bec_de_fer",
        "griffeur_de_gouttiere",
        "fouine_fatale",
        "corvide_masque",
        "belette_braqueuse",
        "baron_griffu",
        "renardeau_chapardeur",
        "chouette_guetteuse",
        "putois_fourbe",
        "lynx_solitaire",
        "grand_loup_hurleur",
      ].sort(),
    );
  });

  it("chaque ennemi passe la validation Zod", () => {
    for (const enemy of Object.values(ENEMY_CATALOG)) {
      expect(() => enemyDefinitionSchema.parse(enemy)).not.toThrow();
    }
  });

  it("chaque id du pattern correspond à un move déclaré", () => {
    for (const enemy of Object.values(ENEMY_CATALOG)) {
      for (const moveId of enemy.pattern) {
        expect(enemy.moves.some((m) => m.id === moveId)).toBe(true);
      }
    }
  });

  it("les PV des ennemis de l'Acte I correspondent aux specs", () => {
    expect(MULOT_MASQUE.maxHp).toBe(42);
    expect(CAMPAGNOL_CAGOULE.maxHp).toBe(38);
    expect(PIE_KLEPTOMANE.maxHp).toBe(34);
    expect(MERLE_MERCENAIRE.maxHp).toBe(60);
    expect(BARONNE_BEC_DE_FER.maxHp).toBe(100);
  });

  it("les PV des ennemis de l'Acte II correspondent au gabarit choisi", () => {
    expect(GRIFFEUR_DE_GOUTTIERE.maxHp).toBe(40);
    expect(FOUINE_FATALE.maxHp).toBe(44);
    expect(CORVIDE_MASQUE.maxHp).toBe(40);
    expect(BELETTE_BRAQUEUSE.maxHp).toBe(68);
    expect(BARON_GRIFFU.maxHp).toBe(112);
  });

  it("les PV des ennemis de l'Acte III correspondent au gabarit choisi (encore un cran au-dessus de l'Acte II)", () => {
    expect(RENARDEAU_CHAPARDEUR.maxHp).toBe(46);
    expect(CHOUETTE_GUETTEUSE.maxHp).toBe(44);
    expect(PUTOIS_FOURBE.maxHp).toBe(48);
    expect(LYNX_SOLITAIRE.maxHp).toBe(78);
    expect(GRAND_LOUP_HURLEUR.maxHp).toBe(128);
  });
});
