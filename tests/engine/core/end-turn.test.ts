import { describe, expect, it } from "vitest";
import { resolveEndTurn } from "../../../src/engine/core";
import { makeEnemy, makeState } from "../helpers";
import type { CardInstance, EnemyMoveDef } from "../../../src/engine/types";

const filler: CardInstance = { instanceId: "c1", cardId: "filler", upgraded: false };

const hit: EnemyMoveDef = { id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 5 }] };
const bigHit: EnemyMoveDef = {
  id: "big_hit",
  nameKey: "test.big",
  effects: [{ kind: "damage", target: "enemy", amount: 999 }],
};
const selfBlock: EnemyMoveDef = { id: "block", nameKey: "test.block", effects: [{ kind: "block", target: "self", amount: 5 }] };

describe("resolveEndTurn", () => {
  it("tick les statuts du héros puis défausse toute la main", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "seve_empoisonnee", stacks: 3 }], retainsBlock: false },
      hand: [filler],
      enemies: [makeEnemy({ instanceId: "e", hp: 20, intent: selfBlock, moves: { block: selfBlock }, pattern: ["block"] })],
    });
    const next = resolveEndTurn(state);
    expect(next.hero.hp).toBe(77); // tick du poison avant tout le reste
    // Le combat continue : resolveEndTurn enchaîne sur startHeroTurn, qui
    // repioche aussitôt une main — on vérifie donc le passage par la
    // défausse via drawPile/discardPile plutôt que l'état transitoire de
    // la main en main. La seule carte du jeu (filler) a bien été défaussée
    // puis repiochée, ce qui prouve le cycle défausse -> remélange -> pioche.
    expect(next.hand).toEqual([filler]);
    expect(next.discardPile).toEqual([]);
    expect(next.drawPile).toEqual([]);
  });

  it("résout l'intention de chaque ennemi vivant puis son propre tick, dans l'ordre", () => {
    const state = makeState({
      enemies: [
        makeEnemy({
          instanceId: "a",
          hp: 20,
          intent: hit,
          moves: { hit },
          pattern: ["hit"],
          statuses: [{ id: "seve_empoisonnee", stacks: 2 }],
        }),
        makeEnemy({ instanceId: "b", hp: 20, intent: selfBlock, moves: { block: selfBlock }, pattern: ["block"] }),
      ],
    });
    const next = resolveEndTurn(state);
    expect(next.hero.hp).toBe(state.hero.hp - 5); // move "hit" de l'ennemi a
    expect(next.enemies.find((e) => e.instanceId === "a")?.hp).toBe(18); // tick poison après son move
    expect(next.enemies.find((e) => e.instanceId === "b")?.block).toBe(5);
  });

  it("s'arrête dès que le héros meurt, sans traiter les ennemis suivants", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 10, block: 0, statuses: [], retainsBlock: false },
      enemies: [
        makeEnemy({ instanceId: "a", hp: 20, intent: bigHit, moves: { big_hit: bigHit }, pattern: ["big_hit"], movesTaken: 0 }),
        makeEnemy({ instanceId: "b", hp: 20, intent: hit, moves: { hit }, pattern: ["hit"], movesTaken: 0 }),
      ],
    });
    const next = resolveEndTurn(state);
    expect(next.outcome).toBe("defaite");
    expect(next.enemies.find((e) => e.instanceId === "b")?.movesTaken).toBe(0);
  });

  it("ignore le tick de fin de tour d'un ennemi tué pendant la résolution de son propre move (riposte)", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 80, block: 0, statuses: [{ id: "piquants", stacks: 999 }], retainsBlock: false },
      enemies: [
        makeEnemy({
          instanceId: "a",
          hp: 5,
          intent: hit,
          moves: { hit },
          pattern: ["hit"],
          statuses: [{ id: "repousse", stacks: 10 }],
        }),
      ],
    });
    const next = resolveEndTurn(state);
    const enemyA = next.enemies.find((e) => e.instanceId === "a");
    expect(enemyA?.hp).toBe(0); // tué par la riposte, pas soigné ensuite par Repousse
  });

  it("s'arrête dès le tick des statuts du héros s'il en meurt (avant même la défausse)", () => {
    const state = makeState({
      hero: { maxHp: 80, hp: 2, block: 0, statuses: [{ id: "seve_empoisonnee", stacks: 5 }], retainsBlock: false },
      hand: [filler],
      enemies: [makeEnemy({ instanceId: "e", hp: 20, intent: selfBlock, moves: { block: selfBlock }, pattern: ["block"] })],
    });
    const next = resolveEndTurn(state);
    expect(next.outcome).toBe("defaite");
    expect(next.hand).toEqual([filler]); // jamais défaussée, le combat s'arrête avant
  });

  it("saute un ennemi déjà mort en entrant dans la boucle", () => {
    const state = makeState({
      enemies: [
        makeEnemy({ instanceId: "already-dead", hp: 0, intent: hit, moves: { hit }, pattern: ["hit"], movesTaken: 0 }),
        makeEnemy({ instanceId: "b", hp: 20, intent: selfBlock, moves: { block: selfBlock }, pattern: ["block"] }),
      ],
    });
    const next = resolveEndTurn(state);
    expect(next.enemies.find((e) => e.instanceId === "already-dead")?.movesTaken).toBe(0);
    expect(next.enemies.find((e) => e.instanceId === "b")?.block).toBe(5);
  });

  it("déclenche la victoire si le tick de fin de tour d'un ennemi l'achève lui-même", () => {
    const state = makeState({
      enemies: [
        makeEnemy({
          instanceId: "a",
          hp: 2,
          intent: selfBlock,
          moves: { block: selfBlock },
          pattern: ["block"],
          statuses: [{ id: "seve_empoisonnee", stacks: 5 }],
        }),
      ],
    });
    const next = resolveEndTurn(state);
    expect(next.outcome).toBe("victoire");
    expect(next.enemies[0]?.hp).toBe(0);
  });

  it("enchaîne sur startHeroTurn si le combat continue", () => {
    const state = makeState({
      hand: [],
      drawPile: [filler],
      enemies: [makeEnemy({ instanceId: "e", hp: 20, intent: selfBlock, moves: { block: selfBlock }, pattern: ["block"] })],
    });
    const next = resolveEndTurn(state);
    expect(next.turnNumber).toBe(state.turnNumber + 1);
    expect(next.energy).toBe(next.maxEnergy);
  });
});
