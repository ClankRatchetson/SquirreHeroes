import { describe, expect, it } from "vitest";
import { previewCampfireHeal, resolveCampfireHeal, resolveCampfireUpgrade } from "../../../src/engine/run/campfire";
import { makeCard, makeRunState } from "../helpers";
import type { Card } from "../../../src/engine/types";

const upgradable: Card = makeCard({
  id: "guard",
  hero: "neutre",
  upgraded: { nameKey: "test.guard.up", effects: [] },
});
const CATALOG: Readonly<Record<string, Card>> = { guard: upgradable };

describe("previewCampfireHeal / resolveCampfireHeal", () => {
  it("soigne 30% des PV manquants, arrondi bas", () => {
    const state = makeRunState({ phase: "feu_de_camp", heroMaxHp: 80, heroHp: 50 });
    expect(previewCampfireHeal(state)).toBe(9);
    const next = resolveCampfireHeal(state);
    expect(next.heroHp).toBe(59);
    expect(next.phase).toBe("carte");
  });

  it("ne dépasse jamais heroMaxHp", () => {
    const state = makeRunState({ phase: "feu_de_camp", heroMaxHp: 80, heroHp: 79 });
    const next = resolveCampfireHeal(state);
    expect(next.heroHp).toBeLessThanOrEqual(80);
  });

  it("no-op hors phase feu_de_camp", () => {
    const state = makeRunState({ phase: "carte", heroHp: 50 });
    expect(resolveCampfireHeal(state)).toBe(state);
  });
});

describe("resolveCampfireUpgrade", () => {
  it("améliore la carte du deck ciblée", () => {
    const state = makeRunState({
      phase: "feu_de_camp",
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "guard", upgraded: false }],
    });
    const next = resolveCampfireUpgrade(state, "rc-0");
    expect(next.deck[0]?.upgraded).toBe(true);
    expect(next.phase).toBe("carte");
  });

  it("no-op si la carte est déjà améliorée", () => {
    const state = makeRunState({
      phase: "feu_de_camp",
      cardCatalog: CATALOG,
      deck: [{ runCardId: "rc-0", cardId: "guard", upgraded: true }],
    });
    expect(resolveCampfireUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op si la carte à améliorer est introuvable dans le deck", () => {
    const state = makeRunState({ phase: "feu_de_camp", cardCatalog: CATALOG, deck: [] });
    expect(resolveCampfireUpgrade(state, "rc-0")).toBe(state);
  });

  it("no-op hors phase feu_de_camp", () => {
    const state = makeRunState({ phase: "carte", cardCatalog: CATALOG, deck: [] });
    expect(resolveCampfireUpgrade(state, "rc-0")).toBe(state);
  });
});
