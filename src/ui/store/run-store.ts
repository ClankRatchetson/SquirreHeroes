import { create } from "zustand";
import { runReducer } from "../../engine/run/reducer";
import { createRun } from "../../engine/run/create-run";
import type { CombatAction, RunAction, RunState } from "../../engine/types";
import { CARD_CATALOG } from "../../content/cards";
import { CASSE_NOIX } from "../../content/heroes";
import { ENEMY_CATALOG } from "../../content/enemies";
import { EVENT_CATALOG } from "../../content/events";
import { RUN_ACTS } from "../../content/acts";
import { hydrateRunState } from "../../persistence";
import { persistCurrentSaveFile } from "../persistence/persist-save-file";
import { useMetaStore } from "./meta-store";
import { diffCombatStates } from "../animation/diff-events";
import { staggerEnemyTurnPresentation } from "../animation/stagger-enemy-turn";
import type { TargetingState } from "./combat-store.types";
import type { RunStoreState } from "./run-store.types";

const EMPTY_TARGETING: TargetingState = { selectedCardInstanceId: null, hoveredEnemyInstanceId: null };

function isCombatAction(action: RunAction): action is CombatAction {
  return action.type === "PLAY_CARD" || action.type === "END_TURN";
}

/** Sauvegarde automatique — après toute action de run effective (cf. §6 du plan Phase 4), jamais bloquant. */
function persist(nextRun: RunState): void {
  persistCurrentSaveFile(nextRun, useMetaStore.getState().meta);
}

/**
 * À la transition `phase → "run_over"`, `recordRunCompletion` écrit déjà
 * `runState` ET `meta` ensemble (cf. `meta-store.ts`) — appeler `persist`
 * en plus serait une seconde écriture redondante du même run, jamais
 * corrompue mais inutile.
 */
function persistOrRecordCompletion(prevRun: RunState, nextRun: RunState): void {
  if (nextRun.phase === "run_over" && prevRun.phase !== "run_over") {
    useMetaStore.getState().recordRunCompletion(nextRun);
  } else {
    persist(nextRun);
  }
}

/**
 * Store Zustand de la structure de run — miroir de `combat-store.ts`.
 * `runState` est l'unique source de vérité, toute évolution passe par
 * `runReducer`. `dispatch` gère les actions génériques (carte, boutique,
 * récompense, feu de camp, événement) ; `selectCard`/`hoverEnemy`/
 * `playCard`/`endTurn`/`consumeEvent` existent en plus pour que
 * `CombatController` puisse piloter les composants de combat de la Phase 2
 * indifféremment depuis ce store ou `useCombatStore`.
 */
export const useRunStore = create<RunStoreState>((set, get) => ({
  runState: null,
  targeting: EMPTY_TARGETING,
  pendingEvents: [],
  isResolvingEnemyTurn: false,

  startNewRun: (seed, bonuses, hero, familiar) => {
    const runState = createRun({
      hero: hero ?? CASSE_NOIX,
      cardCatalog: CARD_CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
      acts: RUN_ACTS,
      seed,
      bonusMaxHp: bonuses?.bonusMaxHp,
      upgradedStartingCardIds: bonuses?.upgradedStartingCardIds,
      noisettesBonusPerCombat: bonuses?.noisettesBonusPerCombat,
      familiar,
    });
    set({ runState, targeting: EMPTY_TARGETING, pendingEvents: [], isResolvingEnemyTurn: false });
    // `recordRunStart` relit `useRunStore.getState().runState` (déjà à jour ci-dessus) et
    // persiste `runState`+`meta` ensemble — pas de `persist(runState)` séparé nécessaire.
    useMetaStore.getState().recordRunStart();
  },

  hydrateRun: (persisted) => {
    const runState = hydrateRunState(persisted, {
      cardCatalog: CARD_CATALOG,
      enemyCatalog: ENEMY_CATALOG,
      eventCatalog: EVENT_CATALOG,
    });
    set({ runState, targeting: EMPTY_TARGETING, pendingEvents: [], isResolvingEnemyTurn: false });
  },

  dispatch: (action) => {
    const prevRun = get().runState;
    if (!prevRun) {
      return;
    }

    if (isCombatAction(action) && prevRun.pendingCombat) {
      const prevCombat = prevRun.pendingCombat;
      const nextRun = runReducer(prevRun, action);
      if (nextRun === prevRun) {
        return;
      }
      persistOrRecordCompletion(prevRun, nextRun);

      if (nextRun.phase === "combat" && nextRun.pendingCombat) {
        const nextCombat = nextRun.pendingCombat;
        if (action.type === "END_TURN") {
          set({ runState: nextRun, isResolvingEnemyTurn: true, targeting: EMPTY_TARGETING });
          staggerEnemyTurnPresentation(
            prevCombat,
            nextCombat,
            (events) => {
              set((s) => ({ pendingEvents: [...s.pendingEvents, ...events] }));
            },
            (resolving) => {
              set({ isResolvingEnemyTurn: resolving });
            },
          );
        } else {
          const events = diffCombatStates(prevCombat, nextCombat);
          set((s) => ({ runState: nextRun, pendingEvents: [...s.pendingEvents, ...events], targeting: EMPTY_TARGETING }));
        }
      } else {
        // Combat terminé (victoire/défaite) : la run change d'écran, pas besoin d'étaler la présentation.
        set({ runState: nextRun, targeting: EMPTY_TARGETING });
      }
      return;
    }

    const nextRun = runReducer(prevRun, action);
    if (nextRun === prevRun) {
      return;
    }
    persistOrRecordCompletion(prevRun, nextRun);
    set({ runState: nextRun, targeting: EMPTY_TARGETING });
  },

  selectCard: (cardInstanceId) => {
    set((s) => ({ targeting: { ...s.targeting, selectedCardInstanceId: cardInstanceId } }));
  },

  hoverEnemy: (enemyInstanceId) => {
    set((s) => ({ targeting: { ...s.targeting, hoveredEnemyInstanceId: enemyInstanceId } }));
  },

  playCard: (cardInstanceId, targetEnemyId) => {
    get().dispatch({
      type: "PLAY_CARD",
      cardInstanceId,
      ...(targetEnemyId !== undefined ? { targetEnemyId } : {}),
    });
  },

  endTurn: () => {
    get().dispatch({ type: "END_TURN" });
  },

  consumeEvent: (eventId) => {
    set((s) => ({ pendingEvents: s.pendingEvents.filter((e) => e.id !== eventId) }));
  },
}));
