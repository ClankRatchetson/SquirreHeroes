import { describe, expect, it } from "vitest";
import { createRng } from "../../src/engine/rng";
import { chooseCombatAction } from "../../src/sim/policy/combat-policy";
import { chooseRunAction } from "../../src/sim/policy/run-policy";
import { makeCard, makeRunNode, makeRunState, makeState } from "../engine/helpers";
import type { Card, EventDefinition } from "../../src/engine/types";

describe("chooseCombatAction", () => {
  const strike: Card = makeCard({ id: "strike", cost: 2, type: "attaque", effects: [{ kind: "damage", target: "enemy", amount: 5 }] });
  const block: Card = makeCard({ id: "block", cost: 2, type: "defense", effects: [{ kind: "block", target: "self", amount: 5 }] });
  const cheapAttack: Card = makeCard({ id: "cheap", cost: 1, type: "attaque", effects: [{ kind: "damage", target: "enemy", amount: 3 }] });
  const CATALOG: Readonly<Record<string, Card>> = { strike, block, cheap: cheapAttack };

  it("joue la carte jouable la plus chère, attaque départagée en priorité à coût égal", () => {
    const combat = makeState({
      hand: [
        { instanceId: "i-block", cardId: "block", upgraded: false },
        { instanceId: "i-strike", cardId: "strike", upgraded: false },
        { instanceId: "i-cheap", cardId: "cheap", upgraded: false },
      ],
      cardCatalog: CATALOG,
    });
    const action = chooseCombatAction(combat, CATALOG);
    expect(action).toEqual({ type: "PLAY_CARD", cardInstanceId: "i-strike", targetEnemyId: "enemy-0" });
  });

  it("END_TURN si aucune carte n'est jouable (main vide)", () => {
    const combat = makeState({ hand: [], cardCatalog: CATALOG });
    expect(chooseCombatAction(combat, CATALOG)).toEqual({ type: "END_TURN" });
  });
});

describe("chooseRunAction — carte", () => {
  it("choisit toujours un nœud atteignable", () => {
    const state = makeRunState({
      currentNodeId: null,
      phase: "carte",
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [
          makeRunNode({ id: "n0", type: "combat", floor: 0 }),
          makeRunNode({ id: "n1", type: "boutique", floor: 0 }),
          makeRunNode({ id: "n2", type: "feu_de_camp", floor: 0 }),
        ],
      },
    });
    const seenNodeIds = new Set<string>();
    for (let seed = 0; seed < 300; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      expect(action.type).toBe("CHOISIR_NOEUD");
      if (action.type === "CHOISIR_NOEUD") {
        seenNodeIds.add(action.nodeId);
      }
    }
    // Répartition à peu près uniforme sur 300 tirages : les 3 nœuds doivent tous apparaître.
    expect(seenNodeIds).toEqual(new Set(["n0", "n1", "n2"]));
  });

  it("est déterministe : même seed -> même choix", () => {
    const state = makeRunState({
      currentNodeId: null,
      map: {
        actId: "acte_1",
        floorCount: 1,
        nodes: [makeRunNode({ id: "n0", type: "combat", floor: 0 }), makeRunNode({ id: "n1", type: "boutique", floor: 0 })],
      },
    });
    const [actionA] = chooseRunAction(state, createRng(123));
    const [actionB] = chooseRunAction(state, createRng(123));
    expect(actionA).toEqual(actionB);
  });
});

describe("chooseRunAction — recompense", () => {
  it("choisit toujours une des cartes offertes", () => {
    const state = makeRunState({ phase: "recompense", pendingReward: { cardChoices: ["a", "b", "c"], noisettes: 15 } });
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      expect(action.type).toBe("CHOISIR_RECOMPENSE_CARTE");
      if (action.type === "CHOISIR_RECOMPENSE_CARTE") {
        seen.add(action.cardId);
      }
    }
    expect(seen).toEqual(new Set(["a", "b", "c"]));
  });

  it("PASSER_RECOMPENSE si aucune offre en attente", () => {
    const state = makeRunState({ phase: "recompense", pendingReward: null });
    const [action] = chooseRunAction(state, createRng(1));
    expect(action).toEqual({ type: "PASSER_RECOMPENSE" });
  });
});

describe("chooseRunAction — boutique", () => {
  it("n'achète que des slots abordables et non achetés", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 40,
      pendingShop: {
        cardsForSale: [
          { cardId: "cheap", price: 40, purchased: false },
          { cardId: "pricey", price: 90, purchased: false },
          { cardId: "already", price: 10, purchased: true },
        ],
        upgradePrice: 50,
        removePrice: 35,
      },
    });
    for (let seed = 0; seed < 50; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      expect(action).toEqual({ type: "ACHETER_CARTE", cardId: "cheap" });
    }
  });

  it("QUITTER_BOUTIQUE si aucun slot n'est abordable", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 5,
      pendingShop: { cardsForSale: [{ cardId: "pricey", price: 90, purchased: false }], upgradePrice: 50, removePrice: 35 },
    });
    const [action] = chooseRunAction(state, createRng(1));
    expect(action).toEqual({ type: "QUITTER_BOUTIQUE" });
  });
});

describe("chooseRunAction — feu de camp", () => {
  it("toujours FEU_DE_CAMP_SOIGNER si aucune carte n'est améliorable", () => {
    const state = makeRunState({
      phase: "feu_de_camp",
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
      cardCatalog: { strike: makeCard({ id: "strike" }) },
    });
    for (let seed = 0; seed < 50; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      expect(action).toEqual({ type: "FEU_DE_CAMP_SOIGNER" });
    }
  });

  it("alterne soigner/améliorer à peu près 50/50 quand une carte est améliorable", () => {
    const upgradableCard = makeCard({ id: "strike", upgraded: { nameKey: "test.strike.up", effects: [] } });
    const state = makeRunState({
      phase: "feu_de_camp",
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
      cardCatalog: { strike: upgradableCard },
    });
    let heals = 0;
    let upgrades = 0;
    for (let seed = 0; seed < 400; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      if (action.type === "FEU_DE_CAMP_SOIGNER") {
        heals += 1;
      } else if (action.type === "FEU_DE_CAMP_AMELIORER") {
        upgrades += 1;
      }
    }
    expect(heals + upgrades).toBe(400);
    expect(heals).toBeGreaterThan(120);
    expect(upgrades).toBeGreaterThan(120);
  });
});

describe("chooseRunAction — événement", () => {
  const event: EventDefinition = {
    id: "ev",
    titleKey: "test.ev.title",
    textKey: "test.ev.text",
    choices: [
      { id: "a", labelKey: "test.ev.a", effects: [] },
      { id: "b", labelKey: "test.ev.b", effects: [] },
    ],
  };

  it("choisit toujours une option de l'événement en attente", () => {
    const state = makeRunState({ phase: "evenement", pendingEventId: "ev", eventCatalog: { ev: event } });
    const seen = new Set<string>();
    for (let seed = 0; seed < 100; seed += 1) {
      const [action] = chooseRunAction(state, createRng(seed));
      expect(action.type).toBe("CHOISIR_EVENEMENT_OPTION");
      if (action.type === "CHOISIR_EVENEMENT_OPTION") {
        seen.add(action.choiceId);
      }
    }
    expect(seen).toEqual(new Set(["a", "b"]));
  });

  it("END_TURN si l'événement en attente est introuvable dans le catalogue", () => {
    const state = makeRunState({ phase: "evenement", pendingEventId: "does-not-exist", eventCatalog: {} });
    const [action] = chooseRunAction(state, createRng(1));
    expect(action).toEqual({ type: "END_TURN" });
  });
});

describe("chooseRunAction — combat et run_over", () => {
  it("délègue à chooseCombatAction quand un combat est en cours", () => {
    const combat = makeState({ hand: [], cardCatalog: {} });
    const state = makeRunState({ phase: "combat", pendingCombat: combat, cardCatalog: {} });
    const [action, nextRng] = chooseRunAction(state, createRng(1));
    expect(action).toEqual({ type: "END_TURN" });
    expect(nextRng).toEqual(createRng(1));
  });

  it("run_over -> END_TURN, rng inchangé", () => {
    const state = makeRunState({ phase: "run_over" });
    const rng = createRng(1);
    const [action, nextRng] = chooseRunAction(state, rng);
    expect(action).toEqual({ type: "END_TURN" });
    expect(nextRng).toBe(rng);
  });
});
