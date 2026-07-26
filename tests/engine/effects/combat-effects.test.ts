import { describe, expect, it } from "vitest";
import {
  applyBlockEffect,
  applyDamageAllEffect,
  applyDamageEffect,
  applyHealEffect,
  applyMultiHitEffect,
} from "../../../src/engine/effects";
import { enemyCtx, heroCtx, makeEnemy, makeState } from "../helpers";

describe("applyDamageEffect", () => {
  it("inflige des dégâts à l'ennemi ciblé, en absorbant le blocage", () => {
    const state = makeState({ enemies: [makeEnemy({ instanceId: "e", hp: 30, block: 4 })] });
    const next = applyDamageEffect(state, { kind: "damage", target: "enemy", amount: 10 }, heroCtx());
    const enemy = next.enemies[0];
    expect(enemy?.hp).toBe(24); // 10 dégâts, 4 absorbés par le bloc, 6 nets
    expect(enemy?.block).toBe(0);
  });

  it("applique Force de l'attaquant et À découvert du défenseur", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "force", stacks: 2 }], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "e", hp: 30, statuses: [{ id: "a_decouvert", stacks: 1 }] })],
    });
    // (8 + 2) * 1.5 = 15
    const next = applyDamageEffect(state, { kind: "damage", target: "enemy", amount: 8 }, heroCtx());
    expect(next.enemies[0]?.hp).toBe(15);
  });

  it("déclenche Piquants uniquement si des dégâts réels atteignent les PV", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "e", hp: 30, block: 100, statuses: [{ id: "piquants", stacks: 5 }] })],
    });
    const next = applyDamageEffect(state, { kind: "damage", target: "enemy", amount: 10 }, heroCtx());
    expect(next.hero.hp).toBe(80); // entièrement bloqué, pas de riposte
  });

  it("ne fait rien si aucune cible ne se résout", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "a" }), makeEnemy({ instanceId: "b" })],
    });
    const next = applyDamageEffect(state, { kind: "damage", target: "enemy", amount: 10 }, heroCtx());
    expect(next).toEqual(state);
  });
});

describe("applyDamageAllEffect", () => {
  it("touche tous les ennemis vivants et épargne les morts", () => {
    const state = makeState({
      enemies: [
        makeEnemy({ instanceId: "a", hp: 30 }),
        makeEnemy({ instanceId: "dead", hp: 0 }),
        makeEnemy({ instanceId: "b", hp: 30 }),
      ],
    });
    const next = applyDamageAllEffect(state, { kind: "damageAll", amount: 8 }, heroCtx());
    expect(next.enemies.map((e) => e.hp)).toEqual([22, 0, 22]);
  });
});

describe("applyMultiHitEffect", () => {
  it("applique chaque coup indépendamment (déclenche Piquants par coup)", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [], retainsBlock: false },
      enemies: [makeEnemy({ instanceId: "e", hp: 30, statuses: [{ id: "piquants", stacks: 1 }] })],
    });
    const next = applyMultiHitEffect(
      state,
      { kind: "multiHit", target: "enemy", hits: 3, amountPerHit: 4 },
      heroCtx(),
    );
    expect(next.enemies[0]?.hp).toBe(18); // 30 - 3*4
    expect(next.hero.hp).toBe(77); // 3 ripostes de 1
  });
});

describe("applyBlockEffect", () => {
  it("Leste ne s'applique que si resolvingCardType est 'defense'", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "leste", stacks: 3 }], retainsBlock: false },
    });
    const asDefense = applyBlockEffect(
      state,
      { kind: "block", target: "self", amount: 5 },
      heroCtx({ resolvingCardType: "defense" }),
    );
    expect(asDefense.hero.block).toBe(8);

    const asSkill = applyBlockEffect(
      state,
      { kind: "block", target: "self", amount: 5 },
      heroCtx({ resolvingCardType: "competence" }),
    );
    expect(asSkill.hero.block).toBe(5);
  });

  it("un ennemi qui se bloque n'a jamais de bonus Leste (pas de resolvingCardType)", () => {
    const state = makeState({
      enemies: [makeEnemy({ instanceId: "e", statuses: [{ id: "leste", stacks: 10 }] })],
    });
    const next = applyBlockEffect(state, { kind: "block", target: "self", amount: 6 }, enemyCtx("e"));
    expect(next.enemies[0]?.block).toBe(6);
  });
});

describe("applyHealEffect", () => {
  it("plafonne au maximum de PV", () => {
    const state = makeState({ hero: { maxHp: 80, hp: 76, block: 0, statuses: [], retainsBlock: false } });
    const next = applyHealEffect(state, { kind: "heal", target: "self", amount: 10 }, heroCtx());
    expect(next.hero.hp).toBe(80);
  });
});
