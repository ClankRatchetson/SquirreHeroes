import { createRng, type RngState } from "../engine/rng";
import { createRun, type CreateRunParams } from "../engine/run/create-run";
import { runReducer } from "../engine/run/reducer";
import type { CardId, RunState } from "../engine/types";
import { chooseRunAction } from "./policy/run-policy";
import type { SimRunRecord } from "./types";

/**
 * Généreux mais borné : une run complète (bot + achats de boutique + choix
 * de feu de camp) prend nettement moins d'actions que ça en pratique
 * (`scripts/play-run.ts` termine l'Acte I en quelques dizaines d'actions).
 * Si ce plafond est atteint, la run est considérée non résolue et comptée
 * comme non-victoire dans l'agrégation — un signal de bug de politique
 * plutôt qu'un épuisement légitime.
 */
const SAFETY_CAP = 3000;

export interface RunOneParams extends Omit<CreateRunParams, "seed"> {
  /** Seed du moteur (génération de carte, loot, combat) — voir `RunState.rng`. */
  readonly runSeed: number;
  /** Seed du flux de décision du bot — distinct du seed moteur (cf. `run-policy.ts`). */
  readonly policySeed: number;
}

/** Simule UNE run jusqu'à son issue (`victoire`/`defaite`), en enregistrant les choix de cartes pour l'agrégation. */
export function simulateOneRun(params: RunOneParams): SimRunRecord {
  const { runSeed, policySeed, ...createRunParams } = params;
  let state: RunState = createRun({ ...createRunParams, seed: runSeed });
  let policyRng: RngState = createRng(policySeed);

  const cardOffers: { readonly cardId: CardId; readonly chosen: boolean }[] = [];

  for (let i = 0; i < SAFETY_CAP && state.outcome === "en_cours"; i += 1) {
    const [action, nextPolicyRng] = chooseRunAction(state, policyRng);
    policyRng = nextPolicyRng;

    if (action.type === "CHOISIR_RECOMPENSE_CARTE" || action.type === "PASSER_RECOMPENSE") {
      for (const cardId of state.pendingReward?.cardChoices ?? []) {
        cardOffers.push({ cardId, chosen: action.type === "CHOISIR_RECOMPENSE_CARTE" && action.cardId === cardId });
      }
    } else if (action.type === "QUITTER_BOUTIQUE") {
      for (const slot of state.pendingShop?.cardsForSale ?? []) {
        cardOffers.push({ cardId: slot.cardId, chosen: slot.purchased });
      }
    }

    const nextState = runReducer(state, action);
    if (nextState === state) {
      // Action refusée par le moteur : ne devrait jamais arriver avec une politique valide —
      // filet de sécurité pour ne jamais boucler indéfiniment sur un bug de politique.
      break;
    }
    state = nextState;
  }

  return {
    heroId: state.heroId,
    familiarId: state.familiarId,
    victory: state.outcome === "victoire",
    cardOffers,
    finalDeckCardIds: [...new Set(state.deck.map((entry) => entry.cardId))],
  };
}
