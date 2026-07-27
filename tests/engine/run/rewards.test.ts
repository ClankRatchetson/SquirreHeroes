import { describe, expect, it } from "vitest";
import { generateRewardOffer, resolveRewardClaimCard, resolveRewardSkip, REWARD_TABLE } from "../../../src/engine/run/rewards";
import { createRng } from "../../../src/engine/rng";
import { makeCard, makeRunState } from "../helpers";
import type { Card } from "../../../src/engine/types";

const strike: Card = makeCard({ id: "strike", hero: "casse_noix" });
const neutralCard: Card = makeCard({ id: "flair", hero: "neutre" });
const curse: Card = makeCard({ id: "curse", hero: "neutre", type: "malediction" });
const familiarCard: Card = makeCard({ id: "familiar_signature", hero: "mesange_radar" });
const CATALOG: Readonly<Record<string, Card>> = {
  strike,
  flair: neutralCard,
  curse,
  familiar_signature: familiarCard,
};

describe("generateRewardOffer", () => {
  it("exclut les malédictions du pool de récompenses", () => {
    const [offer] = generateRewardOffer(createRng(1), CATALOG, "casse_noix", null, "combat");
    expect(offer.cardChoices).not.toContain("curse");
  });

  it("applique le bon montant de Noisettes selon le type de nœud", () => {
    const [combatOffer] = generateRewardOffer(createRng(1), CATALOG, "casse_noix", null, "combat");
    const [eliteOffer] = generateRewardOffer(createRng(1), CATALOG, "casse_noix", null, "elite");
    expect(combatOffer.noisettes).toBe(REWARD_TABLE.combat);
    expect(eliteOffer.noisettes).toBe(REWARD_TABLE.elite);
  });

  it("la carte signature d'un familier n'est éligible que si ce familier est actif", () => {
    const soloCatalog: Readonly<Record<string, Card>> = { familiar_signature: familiarCard };
    const [withoutFamiliar] = generateRewardOffer(createRng(1), soloCatalog, "casse_noix", null, "combat");
    expect(withoutFamiliar.cardChoices).not.toContain("familiar_signature");

    const [withOtherFamiliar] = generateRewardOffer(createRng(1), soloCatalog, "casse_noix", "taupe_secrete", "combat");
    expect(withOtherFamiliar.cardChoices).not.toContain("familiar_signature");

    const [withMatchingFamiliar] = generateRewardOffer(createRng(1), soloCatalog, "casse_noix", "mesange_radar", "combat");
    expect(withMatchingFamiliar.cardChoices).toContain("familiar_signature");
  });
});

describe("resolveRewardClaimCard", () => {
  it("ajoute la carte choisie au deck et vide pendingReward", () => {
    const state = makeRunState({
      phase: "recompense",
      pendingReward: { cardChoices: ["strike", "flair"], noisettes: 15 },
    });
    const next = resolveRewardClaimCard(state, "strike");
    expect(next.deck).toHaveLength(1);
    expect(next.deck[0]?.cardId).toBe("strike");
    expect(next.deck[0]?.upgraded).toBe(false);
    expect(next.pendingReward).toBeNull();
    expect(next.phase).toBe("carte");
  });

  it("no-op si la carte n'est pas dans les choix proposés", () => {
    const state = makeRunState({
      phase: "recompense",
      pendingReward: { cardChoices: ["strike"], noisettes: 15 },
    });
    const next = resolveRewardClaimCard(state, "flair");
    expect(next).toBe(state);
  });

  it("no-op hors phase recompense", () => {
    const state = makeRunState({ phase: "carte", pendingReward: null });
    const next = resolveRewardClaimCard(state, "strike");
    expect(next).toBe(state);
  });
});

describe("resolveRewardSkip", () => {
  it("vide pendingReward sans toucher au deck", () => {
    const state = makeRunState({
      phase: "recompense",
      pendingReward: { cardChoices: ["strike"], noisettes: 15 },
    });
    const next = resolveRewardSkip(state);
    expect(next.deck).toHaveLength(0);
    expect(next.pendingReward).toBeNull();
    expect(next.phase).toBe("carte");
  });

  it("no-op hors phase recompense", () => {
    const state = makeRunState({ phase: "carte", pendingReward: null });
    expect(resolveRewardSkip(state)).toBe(state);
  });
});
