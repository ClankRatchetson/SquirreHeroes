import { describe, expect, it } from "vitest";
import { runReducer } from "../../../src/engine/run/reducer";
import { createCombat } from "../../../src/engine/core";
import { makeCard, makeRunNode, makeRunState } from "../helpers";
import type { Card, EnemyDefinition, HeroDefinition } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike", cost: 1, effects: [{ kind: "damage", target: "enemy", amount: 50 }] });
const CATALOG: Readonly<Record<string, Card>> = { strike };

const hero: HeroDefinition = { id: "casse_noix", nameKey: "test.hero", maxHp: 80, startingDeck: ["strike"] };

const weakEnemy: EnemyDefinition = {
  id: "weak",
  nameKey: "test.enemy",
  maxHp: 10,
  moves: [{ id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 4 }] }],
  pattern: ["hit"],
};

function stateWithPendingCombat(nodeType: "combat" | "elite" | "boss" = "combat") {
  const combat = createCombat({ hero, enemies: [weakEnemy], cardCatalog: CATALOG, seed: 1 });
  return makeRunState({
    phase: "combat",
    currentNodeId: "node0",
    heroHp: 80,
    heroMaxHp: 80,
    cardCatalog: CATALOG,
    pendingCombat: combat,
    map: {
      actId: "acte_1",
      floorCount: 1,
      nodes: [makeRunNode({ id: "node0", type: nodeType, floor: 0, enemyIds: ["weak"] })],
    },
  });
}

describe("runReducer — forwardToCombat", () => {
  it("forwarde PLAY_CARD/END_TURN à combatReducer et propage le combat resolu", () => {
    const state = stateWithPendingCombat();
    const cardInstanceId = state.pendingCombat?.hand[0]?.instanceId;
    expect(cardInstanceId).toBeDefined();
    const next = runReducer(state, {
      type: "PLAY_CARD",
      cardInstanceId: cardInstanceId as string,
      targetEnemyId: "weak-0",
    });
    // La carte de test inflige 50 dégâts à un ennemi de 10 PV : le combat se termine en victoire
    // dans le même appel — c'est exactement le comportement de composition testé ci-dessous.
    expect(next.phase).toBe("recompense");
  });

  it("victoire sur un nœud combat : crédite les Noisettes, génère une offre, passe en phase récompense", () => {
    const state = stateWithPendingCombat("combat");
    const cardInstanceId = state.pendingCombat?.hand[0]?.instanceId as string;
    const next = runReducer(state, { type: "PLAY_CARD", cardInstanceId, targetEnemyId: "weak-0" });
    expect(next.phase).toBe("recompense");
    expect(next.pendingCombat).toBeNull();
    expect(next.noisettes).toBeGreaterThan(0);
    expect(next.pendingReward).not.toBeNull();
  });

  it("victoire sur le nœud boss : pas de récompense, run_over/victoire", () => {
    const state = stateWithPendingCombat("boss");
    const cardInstanceId = state.pendingCombat?.hand[0]?.instanceId as string;
    const next = runReducer(state, { type: "PLAY_CARD", cardInstanceId, targetEnemyId: "weak-0" });
    expect(next.phase).toBe("run_over");
    expect(next.outcome).toBe("victoire");
    expect(next.pendingReward).toBeNull();
  });

  it("harvest HP : les PV du héros après combat sont reportés sur heroHp", () => {
    const state = stateWithPendingCombat();
    const cardInstanceId = state.pendingCombat?.hand[0]?.instanceId as string;
    const next = runReducer(state, { type: "PLAY_CARD", cardInstanceId, targetEnemyId: "weak-0" });
    expect(next.heroHp).toBe(next.pendingCombat?.hero.hp ?? state.pendingCombat?.hero.hp);
  });

  it("défaite en combat : run_over/defaite, heroHp à 0", () => {
    const dyingHero: HeroDefinition = { ...hero, maxHp: 1 };
    const strongEnemy: EnemyDefinition = {
      ...weakEnemy,
      moves: [{ id: "hit", nameKey: "test.hit", effects: [{ kind: "damage", target: "enemy", amount: 99 }] }],
    };
    const combat = createCombat({ hero: dyingHero, enemies: [strongEnemy], cardCatalog: CATALOG, seed: 1 });
    const state = makeRunState({
      phase: "combat",
      currentNodeId: "node0",
      heroHp: 1,
      heroMaxHp: 1,
      cardCatalog: CATALOG,
      pendingCombat: combat,
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [makeRunNode({ id: "node0", type: "combat", floor: 0, enemyIds: ["weak"] })],
      },
    });
    const next = runReducer(state, { type: "END_TURN" });
    expect(next.phase).toBe("run_over");
    expect(next.outcome).toBe("defaite");
    expect(next.heroHp).toBe(0);
  });

  it("no-op si phase !== combat", () => {
    const state = makeRunState({ phase: "carte", pendingCombat: null });
    const next = runReducer(state, { type: "END_TURN" });
    expect(next).toBe(state);
  });

  it("no-op sur action de combat illégale (carte inexistante)", () => {
    const state = stateWithPendingCombat();
    const next = runReducer(state, { type: "PLAY_CARD", cardInstanceId: "does-not-exist" });
    expect(next).toBe(state);
  });
});

describe("runReducer — CHOISIR_NOEUD dispatch", () => {
  it("délègue à resolveChoisirNoeud", () => {
    const state = makeRunState({
      currentNodeId: null,
      phase: "carte",
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [makeRunNode({ id: "n0", type: "feu_de_camp", floor: 0 })],
      },
    });
    const next = runReducer(state, { type: "CHOISIR_NOEUD", nodeId: "n0" });
    expect(next.phase).toBe("feu_de_camp");
  });
});

describe("runReducer — dispatch des autres actions", () => {
  it("CHOISIR_RECOMPENSE_CARTE délègue à resolveRewardClaimCard", () => {
    const state = makeRunState({
      phase: "recompense",
      pendingReward: { cardChoices: ["strike"], noisettes: 15 },
    });
    const next = runReducer(state, { type: "CHOISIR_RECOMPENSE_CARTE", cardId: "strike" });
    expect(next.deck).toHaveLength(1);
    expect(next.phase).toBe("carte");
  });

  it("PASSER_RECOMPENSE délègue à resolveRewardSkip", () => {
    const state = makeRunState({
      phase: "recompense",
      pendingReward: { cardChoices: ["strike"], noisettes: 15 },
    });
    const next = runReducer(state, { type: "PASSER_RECOMPENSE" });
    expect(next.pendingReward).toBeNull();
    expect(next.phase).toBe("carte");
  });

  it("ACHETER_CARTE délègue à resolveBuyCard", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      pendingShop: { cardsForSale: [{ cardId: "strike", price: 40, purchased: false }], upgradePrice: 50, removePrice: 35 },
    });
    const next = runReducer(state, { type: "ACHETER_CARTE", cardId: "strike" });
    expect(next.deck).toHaveLength(1);
  });

  it("ACHETER_AMELIORATION délègue à resolveBuyUpgrade", () => {
    const state = makeRunState({ phase: "boutique", pendingShop: null });
    expect(runReducer(state, { type: "ACHETER_AMELIORATION", runCardId: "rc-0" })).toBe(state);
  });

  it("ACHETER_SUPPRESSION délègue à resolveBuyRemoval", () => {
    const state = makeRunState({ phase: "boutique", pendingShop: null });
    expect(runReducer(state, { type: "ACHETER_SUPPRESSION", runCardId: "rc-0" })).toBe(state);
  });

  it("QUITTER_BOUTIQUE délègue à resolveLeaveShop", () => {
    const state = makeRunState({
      phase: "boutique",
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    const next = runReducer(state, { type: "QUITTER_BOUTIQUE" });
    expect(next.phase).toBe("carte");
  });

  it("FEU_DE_CAMP_SOIGNER délègue à resolveCampfireHeal", () => {
    const state = makeRunState({ phase: "feu_de_camp", heroMaxHp: 80, heroHp: 50 });
    const next = runReducer(state, { type: "FEU_DE_CAMP_SOIGNER" });
    expect(next.heroHp).toBeGreaterThan(50);
    expect(next.phase).toBe("carte");
  });

  it("FEU_DE_CAMP_AMELIORER délègue à resolveCampfireUpgrade", () => {
    const state = makeRunState({ phase: "feu_de_camp", deck: [] });
    expect(runReducer(state, { type: "FEU_DE_CAMP_AMELIORER", runCardId: "rc-0" })).toBe(state);
  });

  it("CHOISIR_EVENEMENT_OPTION délègue à resolveEventChoice", () => {
    const state = makeRunState({
      phase: "evenement",
      pendingEventId: "an_event",
      eventCatalog: {
        an_event: {
          id: "an_event",
          titleKey: "test.title",
          textKey: "test.text",
          choices: [{ id: "a", labelKey: "test.a", effects: [{ kind: "gainNoisettes", amount: 10 }] }],
        },
      },
    });
    const next = runReducer(state, { type: "CHOISIR_EVENEMENT_OPTION", choiceId: "a" });
    expect(next.noisettes).toBe(10);
    expect(next.phase).toBe("carte");
  });
});
