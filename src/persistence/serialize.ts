import type { CombatState, RunState } from "../engine/types";
import type { PersistedCombatState, PersistedRunState, RunContentCatalogs } from "./save-file";

/**
 * Reconstruction explicite plutôt que déstructuration-puis-rest (qui
 * laisserait des liaisons `cardCatalog`/etc. non utilisées, rejetées par
 * `no-unused-vars`) : un bénéfice concret est qu'un futur champ ajouté à
 * `CombatState`/`RunState` fait échouer la compilation ici tant qu'il n'est
 * pas explicitement traité (gardé ou volontairement omis), plutôt que de
 * silencieusement se retrouver oublié dans un `...rest`.
 */
function stripCombatState(combat: CombatState): PersistedCombatState {
  return {
    hero: combat.hero,
    enemies: combat.enemies,
    drawPile: combat.drawPile,
    hand: combat.hand,
    discardPile: combat.discardPile,
    exhaustPile: combat.exhaustPile,
    energy: combat.energy,
    maxEnergy: combat.maxEnergy,
    turnNumber: combat.turnNumber,
    phase: combat.phase,
    outcome: combat.outcome,
    rng: combat.rng,
    nextInstanceSeq: combat.nextInstanceSeq,
  };
}

function hydrateCombatState(persisted: PersistedCombatState, cardCatalog: RunContentCatalogs["cardCatalog"]): CombatState {
  return { ...persisted, cardCatalog };
}

/** Ne connaît que `/src/engine/types` — jamais `/src/content` : le réattachement des catalogues se fait à l'appelant. */
export function stripRunState(run: RunState): PersistedRunState {
  return {
    heroId: run.heroId,
    heroMaxHp: run.heroMaxHp,
    heroHp: run.heroHp,
    deck: run.deck,
    noisettes: run.noisettes,
    map: run.map,
    currentNodeId: run.currentNodeId,
    visitedNodeIds: run.visitedNodeIds,
    phase: run.phase,
    outcome: run.outcome,
    pendingCombat: run.pendingCombat ? stripCombatState(run.pendingCombat) : null,
    pendingReward: run.pendingReward,
    pendingShop: run.pendingShop,
    pendingEventId: run.pendingEventId,
    rng: run.rng,
    nextRunCardSeq: run.nextRunCardSeq,
    noisettesBonusPerCombat: run.noisettesBonusPerCombat,
  };
}

export function hydrateRunState(persisted: PersistedRunState, catalogs: RunContentCatalogs): RunState {
  return {
    ...persisted,
    cardCatalog: catalogs.cardCatalog,
    enemyCatalog: catalogs.enemyCatalog,
    eventCatalog: catalogs.eventCatalog,
    pendingCombat: persisted.pendingCombat ? hydrateCombatState(persisted.pendingCombat, catalogs.cardCatalog) : null,
  };
}
