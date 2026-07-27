import { nextInt, type RngState } from "../../engine/rng";
import { getReachableNodeIds } from "../../engine/run/selectors";
import type { RunAction, RunState } from "../../engine/types";
import { chooseCombatAction } from "./combat-policy";

/**
 * Tire un élément uniformément au hasard dans `items`, via le PRNG seedé du
 * harnais (jamais `Math.random()`, jamais le `RunState.rng` interne au
 * moteur — ce dernier est réservé à la génération de carte/loot, distinct
 * du flux de décision du bot, exactement comme les choix d'un joueur humain
 * ne font pas partie de l'état moteur). `undefined` si `items` est vide.
 */
function pickUniform<T>(rng: RngState, items: readonly T[]): readonly [T | undefined, RngState] {
  if (items.length === 0) {
    return [undefined, rng];
  }
  const [index, nextRng] = nextInt(rng, items.length);
  return [items[index], nextRng];
}

/**
 * Politique de décision du bot pour la structure de run (Phase 6) —
 * délibérément **aléatoire uniforme** (jamais pondérée par rareté/type) à
 * chaque point de choix du joueur (nœud, récompense, boutique, feu de camp,
 * événement) : laisser les DONNÉES révéler la qualité d'une carte via sa
 * corrélation au taux de victoire exige un échantillonnage non biaisé — si
 * le bot préjuge des "bonnes" cartes, le rapport ne mesurerait que son
 * propre biais, pas l'équilibrage réel du contenu. Seul le combat reste
 * gouverné par l'heuristique gloutonne déjà établie (`chooseCombatAction`),
 * qui n'est pas l'objet de cette analyse de contenu.
 */
export function chooseRunAction(state: RunState, rng: RngState): readonly [RunAction, RngState] {
  switch (state.phase) {
    case "combat": {
      const action = state.pendingCombat
        ? chooseCombatAction(state.pendingCombat, state.cardCatalog)
        : { type: "END_TURN" as const };
      return [action, rng];
    }
    case "carte": {
      const [nodeId, nextRng] = pickUniform(rng, getReachableNodeIds(state));
      return [nodeId !== undefined ? { type: "CHOISIR_NOEUD", nodeId } : { type: "END_TURN" }, nextRng];
    }
    case "recompense": {
      const [cardId, nextRng] = pickUniform(rng, state.pendingReward?.cardChoices ?? []);
      return [
        cardId !== undefined ? { type: "CHOISIR_RECOMPENSE_CARTE", cardId } : { type: "PASSER_RECOMPENSE" },
        nextRng,
      ];
    }
    case "boutique": {
      const affordableSlots = (state.pendingShop?.cardsForSale ?? []).filter(
        (slot) => !slot.purchased && slot.price <= state.noisettes,
      );
      const [slot, nextRng] = pickUniform(rng, affordableSlots);
      return [slot !== undefined ? { type: "ACHETER_CARTE", cardId: slot.cardId } : { type: "QUITTER_BOUTIQUE" }, nextRng];
    }
    case "feu_de_camp": {
      const upgradableRunCardIds = state.deck
        .filter((entry) => !entry.upgraded && state.cardCatalog[entry.cardId]?.upgraded)
        .map((entry) => entry.runCardId);
      if (upgradableRunCardIds.length === 0) {
        return [{ type: "FEU_DE_CAMP_SOIGNER" }, rng];
      }
      const [coinFlip, rngAfterFlip] = nextInt(rng, 2);
      if (coinFlip === 0) {
        return [{ type: "FEU_DE_CAMP_SOIGNER" }, rngAfterFlip];
      }
      const [runCardId, nextRng] = pickUniform(rngAfterFlip, upgradableRunCardIds);
      return [runCardId !== undefined ? { type: "FEU_DE_CAMP_AMELIORER", runCardId } : { type: "FEU_DE_CAMP_SOIGNER" }, nextRng];
    }
    case "evenement": {
      const event = state.pendingEventId ? state.eventCatalog[state.pendingEventId] : undefined;
      const [choice, nextRng] = pickUniform(rng, event?.choices ?? []);
      return [choice !== undefined ? { type: "CHOISIR_EVENEMENT_OPTION", choiceId: choice.id } : { type: "END_TURN" }, nextRng];
    }
    case "run_over":
      return [{ type: "END_TURN" }, rng];
  }
}
