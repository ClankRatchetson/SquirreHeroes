import { describe, expect, it } from "vitest";
import { CAMPAGNOL_CAGOULE, ENEMY_CATALOG, MULOT_MASQUE, PIE_KLEPTOMANE } from "../../src/content/enemies";
import { enemyDefinitionSchema } from "../../src/content/schemas";

describe("catalogue d'ennemis", () => {
  it("contient les 3 ennemis communs de l'Acte I", () => {
    expect(Object.keys(ENEMY_CATALOG).sort()).toEqual(
      ["campagnol_cagoule", "mulot_masque", "pie_kleptomane"].sort(),
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

  it("les PV des 3 ennemis correspondent aux specs", () => {
    expect(MULOT_MASQUE.maxHp).toBe(42);
    expect(CAMPAGNOL_CAGOULE.maxHp).toBe(38);
    expect(PIE_KLEPTOMANE.maxHp).toBe(34);
  });
});
