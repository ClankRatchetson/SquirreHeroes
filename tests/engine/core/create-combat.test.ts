import { describe, expect, it } from "vitest";
import { createCombat } from "../../../src/engine/core";
import { makeCard } from "../helpers";
import type { Card, EnemyDefinition, HeroDefinition } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike", cost: 1, effects: [{ kind: "damage", target: "enemy", amount: 5 }] });
const guard: Card = makeCard({ id: "guard", cost: 1, effects: [{ kind: "block", target: "self", amount: 5 }] });

const CATALOG: Readonly<Record<string, Card>> = { strike, guard };

const hero: HeroDefinition = {
  id: "casse_noix",
  nameKey: "test.hero",
  maxHp: 50,
  startingDeck: ["strike", "strike", "strike", "strike", "strike", "strike", "guard", "guard"],
};

const enemyDef: EnemyDefinition = {
  id: "dummy",
  nameKey: "test.enemy",
  maxHp: 20,
  moves: [{ id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 3 }] }],
  pattern: ["hit"],
};

describe("createCombat", () => {
  it("initialise PV, énergie et pioche/main correctement", () => {
    const state = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 1 });
    expect(state.hero.hp).toBe(50);
    expect(state.hero.maxHp).toBe(50);
    expect(state.energy).toBe(3);
    expect(state.maxEnergy).toBe(3);
    expect(state.hand).toHaveLength(5);
    expect(state.drawPile).toHaveLength(3);
    expect(state.turnNumber).toBe(1);
    expect(state.phase).toBe("hero_turn");
    expect(state.outcome).toBe("en_cours");
  });

  it("mélange le deck de départ en instances uniques", () => {
    const state = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 1 });
    const allInstanceIds = [...state.hand, ...state.drawPile].map((c) => c.instanceId);
    expect(new Set(allInstanceIds).size).toBe(8);
  });

  it("calcule dès la création l'intention de chaque ennemi", () => {
    const state = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 1 });
    expect(state.enemies[0]?.intent.id).toBe("hit");
    expect(state.enemies[0]?.hp).toBe(20);
  });

  it("est déterministe : la même seed produit le même état initial", () => {
    const a = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 77 });
    const b = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 77 });
    expect(a).toEqual(b);
  });

  it("lève une erreur si un ennemi n'a pas de pattern exploitable (contenu invalide)", () => {
    const brokenEnemy: EnemyDefinition = { ...enemyDef, pattern: [], moves: [] };
    expect(() => createCombat({ hero, enemies: [brokenEnemy], cardCatalog: CATALOG, seed: 1 })).toThrow();
  });

  it("deckOverride remplace le deck de départ, y compris les cartes améliorées", () => {
    const state = createCombat({
      hero,
      enemies: [enemyDef],
      cardCatalog: CATALOG,
      seed: 1,
      deckOverride: [
        { cardId: "strike", upgraded: true },
        { cardId: "guard", upgraded: false },
      ],
    });
    const all = [...state.hand, ...state.drawPile];
    expect(all).toHaveLength(2);
    expect(all.find((c) => c.cardId === "strike")?.upgraded).toBe(true);
    expect(all.find((c) => c.cardId === "guard")?.upgraded).toBe(false);
  });

  it("heroHpOverride fixe les PV de départ sans changer maxHp", () => {
    const state = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 1, heroHpOverride: 12 });
    expect(state.hero.hp).toBe(12);
    expect(state.hero.maxHp).toBe(50);
  });

  it("sans deckOverride/heroHpOverride, le comportement est inchangé", () => {
    const withOverrides = createCombat({
      hero,
      enemies: [enemyDef],
      cardCatalog: CATALOG,
      seed: 1,
      deckOverride: undefined,
      heroHpOverride: undefined,
    });
    const without = createCombat({ hero, enemies: [enemyDef], cardCatalog: CATALOG, seed: 1 });
    expect(withOverrides).toEqual(without);
  });
});
