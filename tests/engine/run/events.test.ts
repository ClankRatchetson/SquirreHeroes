import { describe, expect, it } from "vitest";
import { resolveEventChoice, resolveRunEffect } from "../../../src/engine/run/events";
import { makeRunState } from "../helpers";
import type { EventDefinition } from "../../../src/engine/types";

const EVENT: EventDefinition = {
  id: "an_event",
  titleKey: "test.event.title",
  textKey: "test.event.text",
  choices: [
    {
      id: "gagner",
      labelKey: "test.event.choices.gagner.label",
      effects: [
        { kind: "gainNoisettes", amount: 20 },
        { kind: "damage", amount: 8 },
      ],
    },
    { id: "rien", labelKey: "test.event.choices.rien.label", effects: [] },
    { id: "carte", labelKey: "test.event.choices.carte.label", effects: [{ kind: "addCardToDeck", cardId: "strike" }] },
  ],
};

describe("resolveRunEffect", () => {
  it("damage/heal bornent heroHp dans [0, heroMaxHp]", () => {
    const state = makeRunState({ heroMaxHp: 80, heroHp: 5 });
    expect(resolveRunEffect(state, { kind: "damage", amount: 100 }).heroHp).toBe(0);
    const healed = makeRunState({ heroMaxHp: 80, heroHp: 75 });
    expect(resolveRunEffect(healed, { kind: "heal", amount: 100 }).heroHp).toBe(80);
  });

  it("loseNoisettes ne descend jamais sous 0", () => {
    const state = makeRunState({ noisettes: 5 });
    expect(resolveRunEffect(state, { kind: "loseNoisettes", amount: 100 }).noisettes).toBe(0);
  });

  it("addCardToDeck ajoute une entrée non-améliorée", () => {
    const state = makeRunState({ deck: [] });
    const next = resolveRunEffect(state, { kind: "addCardToDeck", cardId: "strike" });
    expect(next.deck).toHaveLength(1);
    expect(next.deck[0]?.cardId).toBe("strike");
    expect(next.deck[0]?.upgraded).toBe(false);
  });
});

describe("resolveEventChoice", () => {
  it("résout les effets du choix et revient en phase carte", () => {
    const state = makeRunState({
      phase: "evenement",
      pendingEventId: "an_event",
      eventCatalog: { an_event: EVENT },
      noisettes: 0,
      heroHp: 50,
    });
    const next = resolveEventChoice(state, "gagner");
    expect(next.noisettes).toBe(20);
    expect(next.heroHp).toBe(42);
    expect(next.pendingEventId).toBeNull();
    expect(next.phase).toBe("carte");
  });

  it("no-op si choiceId invalide", () => {
    const state = makeRunState({
      phase: "evenement",
      pendingEventId: "an_event",
      eventCatalog: { an_event: EVENT },
    });
    expect(resolveEventChoice(state, "inconnu")).toBe(state);
  });

  it("no-op hors phase evenement", () => {
    const state = makeRunState({ phase: "carte", pendingEventId: null, eventCatalog: { an_event: EVENT } });
    expect(resolveEventChoice(state, "gagner")).toBe(state);
  });
});
