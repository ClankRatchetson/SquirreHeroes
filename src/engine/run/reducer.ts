import type { CombatAction, CombatState, RunAction, RunState } from "../types";
import { combatReducer } from "../core";
import { checkRunOutcome } from "./outcome";
import { resolveChoisirNoeud } from "./enter-node";
import { generateRewardOffer, resolveRewardClaimCard, resolveRewardSkip } from "./rewards";
import { resolveBuyCard, resolveBuyRemoval, resolveBuyUpgrade, resolveLeaveShop } from "./shop";
import { resolveCampfireHeal, resolveCampfireUpgrade } from "./campfire";
import { resolveEventChoice } from "./events";
import { findNode } from "./selectors";

function isCombatAction(action: RunAction): action is CombatAction {
  return action.type === "PLAY_CARD" || action.type === "END_TURN";
}

/** Combat gagné : Noisettes créditées immédiatement, offre de carte générée — sauf sur le nœud `boss`, qui clôt la run. */
function resolveReward(state: RunState, finishedCombat: CombatState): RunState {
  const node = state.currentNodeId !== null ? findNode(state, state.currentNodeId) : undefined;
  const heroHp = finishedCombat.hero.hp;

  if (node?.type === "boss") {
    return { ...state, pendingCombat: null, heroHp, phase: "run_over", outcome: "victoire" };
  }

  const rewardKind = node?.type === "elite" ? "elite" : "combat";
  const [offer, nextRng] = generateRewardOffer(state.rng, state.cardCatalog, state.heroId, rewardKind);
  return {
    ...state,
    pendingCombat: null,
    heroHp,
    noisettes: state.noisettes + offer.noisettes,
    pendingReward: offer,
    phase: "recompense",
    rng: nextRng,
  };
}

function forwardToCombat(state: RunState, action: CombatAction): RunState {
  if (state.phase !== "combat" || !state.pendingCombat) {
    return state;
  }
  const nextCombat = combatReducer(state.pendingCombat, action);
  if (nextCombat === state.pendingCombat) {
    return state;
  }
  if (nextCombat.outcome === "defaite") {
    return { ...state, pendingCombat: nextCombat, heroHp: 0, phase: "run_over", outcome: "defaite" };
  }
  if (nextCombat.outcome === "victoire") {
    return resolveReward(state, nextCombat);
  }
  return { ...state, pendingCombat: nextCombat };
}

/**
 * Point d'entrée unique du réducteur de run. Forwarde `PLAY_CARD`/`END_TURN`
 * à `combatReducer` — c'est ce réducteur, jamais la UI, qui orchestre la
 * transition victoire-de-combat → récompense-de-run.
 */
export function runReducer(state: RunState, action: RunAction): RunState {
  if (isCombatAction(action)) {
    return forwardToCombat(state, action);
  }
  switch (action.type) {
    case "CHOISIR_NOEUD":
      return resolveChoisirNoeud(state, action.nodeId);
    case "CHOISIR_RECOMPENSE_CARTE":
      return checkRunOutcome(resolveRewardClaimCard(state, action.cardId));
    case "PASSER_RECOMPENSE":
      return checkRunOutcome(resolveRewardSkip(state));
    case "ACHETER_CARTE":
      return resolveBuyCard(state, action.cardId);
    case "ACHETER_AMELIORATION":
      return resolveBuyUpgrade(state, action.runCardId);
    case "ACHETER_SUPPRESSION":
      return resolveBuyRemoval(state, action.runCardId);
    case "QUITTER_BOUTIQUE":
      return resolveLeaveShop(state);
    case "FEU_DE_CAMP_SOIGNER":
      return resolveCampfireHeal(state);
    case "FEU_DE_CAMP_AMELIORER":
      return resolveCampfireUpgrade(state, action.runCardId);
    case "CHOISIR_EVENEMENT_OPTION":
      return checkRunOutcome(resolveEventChoice(state, action.choiceId));
  }
}
