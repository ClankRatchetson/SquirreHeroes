import { describe, expect, it } from "vitest";
import {
  applyDiscardEffect,
  applyDrawEffect,
  applyExhaustEffect,
  applyGainEnergyEffect,
} from "../../../src/engine/effects";
import { createRng } from "../../../src/engine/rng";
import { heroCtx, makeState } from "../helpers";

const cardA = { instanceId: "c-a", cardId: "noisette", upgraded: false };
const cardB = { instanceId: "c-b", cardId: "mur", upgraded: false };
const cardC = { instanceId: "c-c", cardId: "grognement", upgraded: false };

describe("applyDrawEffect", () => {
  it("pioche depuis la pioche vers la main", () => {
    const state = makeState({ drawPile: [cardA, cardB], hand: [] });
    const next = applyDrawEffect(state, { kind: "draw", amount: 2 });
    expect(next.hand).toEqual([cardA, cardB]);
    expect(next.drawPile).toEqual([]);
  });

  it("remélange la défausse dans la pioche quand celle-ci est vide", () => {
    const state = makeState({ drawPile: [], discardPile: [cardA, cardB, cardC], hand: [] });
    const next = applyDrawEffect(state, { kind: "draw", amount: 1 });
    expect(next.hand).toHaveLength(1);
    expect(next.discardPile).toEqual([]);
    expect(next.drawPile).toHaveLength(2);
  });

  it("ne fait rien si pioche et défausse sont vides", () => {
    const state = makeState({ drawPile: [], discardPile: [], hand: [] });
    const next = applyDrawEffect(state, { kind: "draw", amount: 3 });
    expect(next.hand).toEqual([]);
  });
});

describe("applyGainEnergyEffect", () => {
  it("ajoute l'énergie", () => {
    const state = makeState({ energy: 1 });
    const next = applyGainEnergyEffect(state, { kind: "gainEnergy", amount: 2 });
    expect(next.energy).toBe(3);
  });
});

describe("applyDiscardEffect", () => {
  it("défausse une carte aléatoire de la main", () => {
    const state = makeState({ hand: [cardA, cardB, cardC], rng: createRng(3) });
    const next = applyDiscardEffect(state, { kind: "discard", amount: 1 });
    expect(next.hand).toHaveLength(2);
    expect(next.discardPile).toHaveLength(1);
  });

  it("ne fait rien si la main est vide", () => {
    const state = makeState({ hand: [] });
    const next = applyDiscardEffect(state, { kind: "discard", amount: 1 });
    expect(next).toEqual(state);
  });
});

describe("applyExhaustEffect", () => {
  it("pousse la carte en cours de résolution dans l'exhaustPile", () => {
    const state = makeState();
    const next = applyExhaustEffect(state, { kind: "exhaust" }, heroCtx({ resolvingCard: cardA }));
    expect(next.exhaustPile).toEqual([cardA]);
  });

  it("ne fait rien si aucune carte n'est en cours de résolution", () => {
    const state = makeState();
    const next = applyExhaustEffect(state, { kind: "exhaust" }, heroCtx());
    expect(next).toEqual(state);
  });

  it("ne duplique pas si la carte est déjà dans l'exhaustPile", () => {
    const state = makeState({ exhaustPile: [cardA] });
    const next = applyExhaustEffect(state, { kind: "exhaust" }, heroCtx({ resolvingCard: cardA }));
    expect(next.exhaustPile).toEqual([cardA]);
  });
});
