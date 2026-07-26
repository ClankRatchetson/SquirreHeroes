import { describe, expect, it } from "vitest";
import {
  applyHeal,
  applyRawHpDamage,
  computeIncomingDamage,
  computeOutgoingBlock,
  computeOutgoingDamage,
} from "../../../src/engine/effects";
import type { StatusInstance } from "../../../src/engine/types";

const statuses = (...entries: readonly [StatusInstance["id"], number][]): readonly StatusInstance[] =>
  entries.map(([id, stacks]) => ({ id, stacks }));

describe("computeOutgoingDamage", () => {
  it("retourne le montant de base sans statut", () => {
    expect(computeOutgoingDamage(10, [])).toBe(10);
  });

  it("ajoute Force à plat avant d'appliquer Étourdi", () => {
    // (10 + 4) * 0.75 = 10.5 -> arrondi à 11 (un seul arrondi final)
    expect(computeOutgoingDamage(10, statuses(["force", 4], ["etourdi", 1]))).toBe(11);
  });

  it("applique Force seule", () => {
    expect(computeOutgoingDamage(10, statuses(["force", 5]))).toBe(15);
  });

  it("applique Étourdi seul (-25%)", () => {
    expect(computeOutgoingDamage(8, statuses(["etourdi", 1]))).toBe(6);
  });

  it("ne descend jamais sous 0", () => {
    expect(computeOutgoingDamage(0, [])).toBe(0);
  });
});

describe("computeIncomingDamage", () => {
  it("absorbe partiellement via le blocage", () => {
    const result = computeIncomingDamage(10, [], 4);
    expect(result).toEqual({ damageToHp: 6, remainingBlock: 0 });
  });

  it("absorbe entièrement quand le blocage suffit", () => {
    const result = computeIncomingDamage(5, [], 10);
    expect(result).toEqual({ damageToHp: 0, remainingBlock: 5 });
  });

  it("applique À découvert (+50%) avant absorption du blocage", () => {
    // 10 * 1.5 = 15, bloc 4 -> 11 dégâts nets
    const result = computeIncomingDamage(10, statuses(["a_decouvert", 1]), 4);
    expect(result).toEqual({ damageToHp: 11, remainingBlock: 0 });
  });
});

describe("computeOutgoingBlock", () => {
  it("retourne le montant de base sans statut", () => {
    expect(computeOutgoingBlock(8, [], false)).toBe(8);
  });

  it("Leste ajoute un bonus à plat uniquement si isDefenseCard est vrai", () => {
    expect(computeOutgoingBlock(8, statuses(["leste", 3]), true)).toBe(11);
    expect(computeOutgoingBlock(8, statuses(["leste", 3]), false)).toBe(8);
  });

  it("Coquille fêlée réduit de 25% après le bonus de Leste", () => {
    // (8 + 4) * 0.75 = 9
    expect(computeOutgoingBlock(8, statuses(["leste", 4], ["coquille_fetee", 1]), true)).toBe(9);
  });
});

describe("applyRawHpDamage", () => {
  it("plafonne à 0", () => {
    expect(applyRawHpDamage(5, 20)).toBe(0);
  });

  it("soustrait normalement", () => {
    expect(applyRawHpDamage(20, 5)).toBe(15);
  });
});

describe("applyHeal", () => {
  it("plafonne au maximum de PV", () => {
    expect(applyHeal(18, 20, 10)).toBe(20);
  });

  it("soigne normalement sous le plafond", () => {
    expect(applyHeal(10, 20, 5)).toBe(15);
  });
});
