import type { HeroDefinition, RunState } from "../types";
import { createCombat } from "../core";
import { nextInt } from "../rng";
import { findNode, getReachableNodeIds } from "./selectors";
import { generateShopOffer } from "./shop";

const SEED_UPPER_BOUND = 2_147_483_647;

/** Contenu du move n'est pas utilisé ici : seuls `maxHp`/`startingDeck` de `HeroDefinition` sont lus par `createCombat`. */
function placeholderHeroDefinition(state: RunState): HeroDefinition {
  return { id: state.heroId, nameKey: "run.internal.unused", maxHp: state.heroMaxHp, startingDeck: [] };
}

export function resolveChoisirNoeud(state: RunState, nodeId: string): RunState {
  if (state.phase !== "carte" || !getReachableNodeIds(state).includes(nodeId)) {
    return state;
  }
  const node = findNode(state, nodeId);
  if (!node) {
    return state;
  }

  const visited: RunState = {
    ...state,
    currentNodeId: nodeId,
    visitedNodeIds: [...state.visitedNodeIds, nodeId],
  };

  switch (node.type) {
    case "combat":
    case "elite":
    case "boss": {
      const enemies = (node.enemyIds ?? []).flatMap((id) => {
        const def = state.enemyCatalog[id];
        return def ? [def] : [];
      });
      const [seed, nextRng] = nextInt(visited.rng, SEED_UPPER_BOUND);
      const pendingCombat = createCombat({
        hero: placeholderHeroDefinition(state),
        enemies,
        cardCatalog: state.cardCatalog,
        seed,
        deckOverride: visited.deck.map((entry) => ({ cardId: entry.cardId, upgraded: entry.upgraded })),
        heroHpOverride: state.heroHp,
      });
      return { ...visited, rng: nextRng, pendingCombat, phase: "combat" };
    }
    case "boutique": {
      const [offer, nextRng] = generateShopOffer(visited.rng, state.cardCatalog, state.heroId);
      return { ...visited, rng: nextRng, pendingShop: offer, phase: "boutique" };
    }
    case "feu_de_camp":
      return { ...visited, phase: "feu_de_camp" };
    case "evenement":
      return { ...visited, pendingEventId: node.eventId ?? null, phase: "evenement" };
  }
}
