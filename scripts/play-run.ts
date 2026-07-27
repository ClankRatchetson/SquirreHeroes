import { runReducer } from "../src/engine/run/reducer";
import { createRun } from "../src/engine/run/create-run";
import { getReachableNodeIds } from "../src/engine/run/selectors";
import type { RunAction, RunState } from "../src/engine/types";
import { CARD_CATALOG } from "../src/content/cards";
import { CASSE_NOIX } from "../src/content/heroes";
import { ENEMY_CATALOG } from "../src/content/enemies";
import { EVENT_CATALOG } from "../src/content/events";
import { tFromContent } from "../src/content/i18n/t";
import { chooseCombatAction } from "../src/sim/policy/combat-policy";

/**
 * Démo CLI déterministe de l'Acte I de bout en bout (miroir de
 * `play-combat.ts` pour la Phase 3) : joue une run entière avec une
 * politique gloutonne — premier nœud atteignable, première offre de
 * récompense/événement acceptée, boutique quittée immédiatement, feu de
 * camp toujours utilisé pour se soigner. Pas d'interactivité stdin.
 */

const SEED = 42;
const SAFETY_CAP = 2000;

function chooseRunAction(state: RunState): RunAction {
  switch (state.phase) {
    case "combat":
      return state.pendingCombat ? chooseCombatAction(state.pendingCombat, CARD_CATALOG) : { type: "END_TURN" };
    case "carte": {
      const nodeId = getReachableNodeIds(state)[0];
      return nodeId !== undefined ? { type: "CHOISIR_NOEUD", nodeId } : { type: "END_TURN" };
    }
    case "recompense": {
      const cardId = state.pendingReward?.cardChoices[0];
      return cardId !== undefined ? { type: "CHOISIR_RECOMPENSE_CARTE", cardId } : { type: "PASSER_RECOMPENSE" };
    }
    case "boutique":
      return { type: "QUITTER_BOUTIQUE" };
    case "feu_de_camp":
      return { type: "FEU_DE_CAMP_SOIGNER" };
    case "evenement": {
      const event = state.pendingEventId ? state.eventCatalog[state.pendingEventId] : undefined;
      const choiceId = event?.choices[0]?.id;
      return choiceId !== undefined ? { type: "CHOISIR_EVENEMENT_OPTION", choiceId } : { type: "END_TURN" };
    }
    case "run_over":
      return { type: "END_TURN" };
  }
}

function printState(state: RunState): void {
  const nodeLabel = state.currentNodeId ?? "(avant le premier choix)";
  console.log(
    `--- Nœud ${nodeLabel} | phase ${state.phase} | PV ${String(state.heroHp)}/${String(state.heroMaxHp)} ` +
      `| Noisettes ${String(state.noisettes)} | deck ${String(state.deck.length)} cartes ---`,
  );
}

let state = createRun({
  hero: CASSE_NOIX,
  cardCatalog: CARD_CATALOG,
  enemyCatalog: ENEMY_CATALOG,
  eventCatalog: EVENT_CATALOG,
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
  seed: SEED,
});

console.log(`Run de démonstration — seed ${String(SEED)} — ${tFromContent(CASSE_NOIX.nameKey)}`);
printState(state);

let previousPhase = state.phase;
for (let i = 0; i < SAFETY_CAP && state.outcome === "en_cours"; i += 1) {
  state = runReducer(state, chooseRunAction(state));
  if (state.phase !== previousPhase) {
    printState(state);
    previousPhase = state.phase;
  }
}

console.log(`Résultat : ${state.outcome}`);

if (state.outcome === "victoire") {
  process.exit(0);
} else if (state.outcome === "defaite") {
  process.exit(1);
} else {
  process.exit(2);
}
