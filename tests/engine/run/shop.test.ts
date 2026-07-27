import { describe, expect, it } from "vitest";
import {
  CARD_PRICE_BY_RARITY,
  generateShopOffer,
  resolveBuyCard,
  resolveBuyRemoval,
  resolveBuyUpgrade,
  resolveLeaveShop,
} from "../../../src/engine/run/shop";
import { createRng } from "../../../src/engine/rng";
import { makeCard, makeRunState } from "../helpers";
import type { Card } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike", hero: "casse_noix", rarity: "rare" });
const upgradable: Card = makeCard({
  id: "guard",
  hero: "neutre",
  rarity: "commune",
  upgraded: { nameKey: "test.guard.up", effects: [] },
});
const CATALOG: Readonly<Record<string, Card>> = { strike, guard: upgradable };

describe("generateShopOffer", () => {
  it("fixe le prix de chaque carte selon sa rareté", () => {
    const [offer] = generateShopOffer(createRng(1), CATALOG, "casse_noix");
    const strikeSlot = offer.cardsForSale.find((s) => s.cardId === "strike");
    expect(strikeSlot?.price).toBe(CARD_PRICE_BY_RARITY.rare);
  });
});

describe("resolveBuyCard", () => {
  it("achète une carte : déduit les Noisettes, ajoute au deck, marque le slot acheté", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      pendingShop: {
        cardsForSale: [{ cardId: "strike", price: 65, purchased: false }],
        upgradePrice: 50,
        removePrice: 35,
      },
    });
    const next = resolveBuyCard(state, "strike");
    expect(next.noisettes).toBe(35);
    expect(next.deck).toHaveLength(1);
    expect(next.pendingShop?.cardsForSale[0]?.purchased).toBe(true);
  });

  it("no-op si fonds insuffisants", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 10,
      pendingShop: {
        cardsForSale: [{ cardId: "strike", price: 65, purchased: false }],
        upgradePrice: 50,
        removePrice: 35,
      },
    });
    expect(resolveBuyCard(state, "strike")).toBe(state);
  });

  it("no-op si le slot est déjà acheté", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      pendingShop: {
        cardsForSale: [{ cardId: "strike", price: 65, purchased: true }],
        upgradePrice: 50,
        removePrice: 35,
      },
    });
    expect(resolveBuyCard(state, "strike")).toBe(state);
  });
});

describe("resolveBuyUpgrade", () => {
  it("améliore une carte éligible et déduit le prix", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "guard", upgraded: false }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    const next = resolveBuyUpgrade(state, "rc-0");
    expect(next.deck[0]?.upgraded).toBe(true);
    expect(next.noisettes).toBe(50);
  });

  it("no-op si la carte n'a pas de version améliorée", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op si fonds insuffisants pour l'amélioration", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 10,
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "guard", upgraded: false }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op si la carte à améliorer est introuvable dans le deck", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      cardCatalog: CATALOG,
      deck: [],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op si la carte est déjà améliorée", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "guard", upgraded: true }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op hors phase boutique", () => {
    const state = makeRunState({ phase: "carte", pendingShop: null });
    expect(resolveBuyUpgrade(state, "rc-0")).toBe(state);
  });
});

describe("resolveBuyRemoval", () => {
  it("retire la carte du deck et déduit le prix", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    const next = resolveBuyRemoval(state, "rc-0");
    expect(next.deck).toHaveLength(0);
    expect(next.noisettes).toBe(65);
  });

  it("no-op si fonds insuffisants pour la suppression", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 5,
      deck: [{ runCardId: "rc-0", cardId: "strike", upgraded: false }],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyRemoval(state, "rc-0")).toBe(state);
  });

  it("no-op si la carte à retirer est introuvable dans le deck", () => {
    const state = makeRunState({
      phase: "boutique",
      noisettes: 100,
      deck: [],
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    expect(resolveBuyRemoval(state, "rc-0")).toBe(state);
  });

  it("no-op hors phase boutique", () => {
    const state = makeRunState({ phase: "carte", pendingShop: null });
    expect(resolveBuyRemoval(state, "rc-0")).toBe(state);
  });
});

describe("resolveLeaveShop", () => {
  it("vide pendingShop et revient à la phase carte", () => {
    const state = makeRunState({
      phase: "boutique",
      pendingShop: { cardsForSale: [], upgradePrice: 50, removePrice: 35 },
    });
    const next = resolveLeaveShop(state);
    expect(next.pendingShop).toBeNull();
    expect(next.phase).toBe("carte");
  });

  it("no-op hors phase boutique", () => {
    const state = makeRunState({ phase: "carte", pendingShop: null });
    expect(resolveLeaveShop(state)).toBe(state);
  });
});
