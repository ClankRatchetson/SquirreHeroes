import { create } from "zustand";
import { combatReducer, createCombat } from "../../engine/core";
import { CARD_CATALOG } from "../../content/cards";
import { CASSE_NOIX } from "../../content/heroes";
import { CAMPAGNOL_CAGOULE, MULOT_MASQUE, PIE_KLEPTOMANE } from "../../content/enemies";
import { diffCombatStates } from "../animation/diff-events";
import { staggerEnemyTurnPresentation } from "../animation/stagger-enemy-turn";
import type { CombatStoreState, TargetingState } from "./combat-store.types";

const EMPTY_TARGETING: TargetingState = { selectedCardInstanceId: null, hoveredEnemyInstanceId: null };

/**
 * Couche de liaison strictement mince entre le moteur et React. `engineState`
 * est l'unique source de vérité (jamais muté à la main, jamais recopié) ;
 * toute évolution de règle passe par `combatReducer`. `targeting` et
 * `pendingEvents` sont de la présentation pure, sans notion côté moteur.
 */
export const useCombatStore = create<CombatStoreState>((set, get) => ({
  engineState: null,
  targeting: EMPTY_TARGETING,
  pendingEvents: [],
  isResolvingEnemyTurn: false,

  startNewCombat: (seed) => {
    const engineState = createCombat({
      hero: CASSE_NOIX,
      enemies: [MULOT_MASQUE, CAMPAGNOL_CAGOULE, PIE_KLEPTOMANE],
      cardCatalog: CARD_CATALOG,
      seed,
    });
    set({ engineState, targeting: EMPTY_TARGETING, pendingEvents: [], isResolvingEnemyTurn: false });
  },

  selectCard: (cardInstanceId) => {
    set((s) => ({ targeting: { ...s.targeting, selectedCardInstanceId: cardInstanceId } }));
  },

  hoverEnemy: (enemyInstanceId) => {
    set((s) => ({ targeting: { ...s.targeting, hoveredEnemyInstanceId: enemyInstanceId } }));
  },

  playCard: (cardInstanceId, targetEnemyId) => {
    const prev = get().engineState;
    if (!prev) {
      return;
    }
    const next = combatReducer(prev, {
      type: "PLAY_CARD",
      cardInstanceId,
      ...(targetEnemyId !== undefined ? { targetEnemyId } : {}),
    });
    if (next === prev) {
      return; // action refusée par le moteur (no-op défensif du réducteur)
    }
    const events = diffCombatStates(prev, next);
    set((s) => ({
      engineState: next,
      pendingEvents: [...s.pendingEvents, ...events],
      targeting: EMPTY_TARGETING,
    }));
  },

  endTurn: () => {
    const prev = get().engineState;
    if (!prev) {
      return;
    }
    const next = combatReducer(prev, { type: "END_TURN" });
    if (next === prev) {
      return;
    }

    // L'état moteur (final) s'affiche immédiatement — seule la PRÉSENTATION
    // des flashs est étalée dans le temps, jamais un second appel au réducteur.
    set({ engineState: next, isResolvingEnemyTurn: true, targeting: EMPTY_TARGETING });

    staggerEnemyTurnPresentation(
      prev,
      next,
      (events) => {
        set((s) => ({ pendingEvents: [...s.pendingEvents, ...events] }));
      },
      (resolving) => {
        set({ isResolvingEnemyTurn: resolving });
      },
    );
  },

  consumeEvent: (eventId) => {
    set((s) => ({ pendingEvents: s.pendingEvents.filter((e) => e.id !== eventId) }));
  },
}));
