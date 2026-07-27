import { describe, expect, it } from "vitest";
import {
  applyEndOfTurnFamiliarDamage,
  applyFirstTurnFamiliarBonus,
  applyPeriodicFamiliarEnergyBonus,
} from "../../../src/engine/effects";
import { makeEnemy, makeState } from "../helpers";

describe("applyFirstTurnFamiliarBonus", () => {
  it("sans familier, ne change rien", () => {
    const state = makeState({ familiarPassive: null });
    expect(applyFirstTurnFamiliarBonus(state)).toBe(state);
  });

  it("bonusDrawFirstTurn : pioche le montant indiqué", () => {
    const cards = Array.from({ length: 3 }, (_, i) => ({ instanceId: `c${String(i)}`, cardId: "filler", upgraded: false }));
    const state = makeState({
      hand: [],
      drawPile: cards,
      familiarPassive: { kind: "bonusDrawFirstTurn", amount: 1 },
    });
    const next = applyFirstTurnFamiliarBonus(state);
    expect(next.hand).toHaveLength(1);
    expect(next.drawPile).toHaveLength(2);
  });

  it("bonusBlockFirstTurn : ajoute du blocage directement, sans passer par les formules de carte", () => {
    const state = makeState({ familiarPassive: { kind: "bonusBlockFirstTurn", amount: 3 } });
    const next = applyFirstTurnFamiliarBonus(state);
    expect(next.hero.block).toBe(3);
  });

  it("un passif sans effet de premier tour (Bourdon Bourru, Taupe Secrète) ne change rien ici", () => {
    const state = makeState({ familiarPassive: { kind: "damageRandomEnemyEndOfTurn", amount: 2 } });
    expect(applyFirstTurnFamiliarBonus(state)).toBe(state);
  });
});

describe("applyPeriodicFamiliarEnergyBonus", () => {
  it("sans familier, ne change rien", () => {
    const state = makeState({ turnNumber: 3, familiarPassive: null });
    expect(applyPeriodicFamiliarEnergyBonus(state)).toBe(state);
  });

  it("bonusEnergyEveryNTurns : gagne l'énergie uniquement aux tours multiples de N", () => {
    const passive = { kind: "bonusEnergyEveryNTurns" as const, amount: 1, everyNTurns: 3 };
    const turn2 = makeState({ turnNumber: 2, energy: 3, familiarPassive: passive });
    expect(applyPeriodicFamiliarEnergyBonus(turn2).energy).toBe(3);

    const turn3 = makeState({ turnNumber: 3, energy: 3, familiarPassive: passive });
    expect(applyPeriodicFamiliarEnergyBonus(turn3).energy).toBe(4);

    const turn6 = makeState({ turnNumber: 6, energy: 3, familiarPassive: passive });
    expect(applyPeriodicFamiliarEnergyBonus(turn6).energy).toBe(4);
  });
});

describe("applyEndOfTurnFamiliarDamage", () => {
  it("sans familier, ne change rien", () => {
    const state = makeState({ familiarPassive: null });
    expect(applyEndOfTurnFamiliarDamage(state)).toBe(state);
  });

  it("damageRandomEnemyEndOfTurn : inflige des dégâts à un ennemi vivant, respecte son blocage", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "only", hp: 20, block: 1 })],
      familiarPassive: { kind: "damageRandomEnemyEndOfTurn", amount: 2 },
    });
    const next = applyEndOfTurnFamiliarDamage(state);
    const enemy = next.enemies.find((e) => e.instanceId === "only");
    // 1 point de blocage absorbe 1 des 2 dégâts.
    expect(enemy?.block).toBe(0);
    expect(enemy?.hp).toBe(19);
  });

  it("ne cible jamais un ennemi déjà mort", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "dead", hp: 0 }), makeEnemy({ instanceId: "alive", hp: 10 })],
      familiarPassive: { kind: "damageRandomEnemyEndOfTurn", amount: 2 },
    });
    const next = applyEndOfTurnFamiliarDamage(state);
    expect(next.enemies.find((e) => e.instanceId === "dead")?.hp).toBe(0);
    expect(next.enemies.find((e) => e.instanceId === "alive")?.hp).toBe(8);
  });

  it("aucun ennemi vivant : no-op (pas de crash sur un tirage aléatoire vide)", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "dead", hp: 0 })],
      familiarPassive: { kind: "damageRandomEnemyEndOfTurn", amount: 2 },
    });
    expect(applyEndOfTurnFamiliarDamage(state)).toBe(state);
  });

  it("n'applique aucun bonus d'attaquant (Force) : dégâts toujours à la valeur brute", () => {
    // Statuts du HÉROS (qui n'attaque pas ici) sans incidence — la Force ne s'applique
    // qu'au véritable attaquant d'un effet `damage`, jamais à ce hook sans combattant source.
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "force", stacks: 10 }], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "only", hp: 20 })],
      familiarPassive: { kind: "damageRandomEnemyEndOfTurn", amount: 2 },
    });
    const next = applyEndOfTurnFamiliarDamage(state);
    expect(next.enemies.find((e) => e.instanceId === "only")?.hp).toBe(18);
  });
});
