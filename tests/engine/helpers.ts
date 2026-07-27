import { createRng } from "../../src/engine/rng";
import type {
  Card,
  CardId,
  CombatState,
  EnemyInstance,
  EnemyMoveDef,
  RunMap,
  RunNode,
  RunNodeType,
  RunState,
  HeroState,
} from "../../src/engine/types";
import type { EffectResolutionContext } from "../../src/engine/effects";

export function makeHero(overrides: Partial<HeroState> = {}): HeroState {
  return {
    maxHp: 80,
    hp: 80,
    block: 0,
    statuses: [],
    retainsBlock: false,
    ...overrides,
  };
}

const NOOP_MOVE: EnemyMoveDef = { id: "noop", nameKey: "test.enemy.noop", effects: [] };

export function makeEnemy(overrides: Partial<EnemyInstance> = {}): EnemyInstance {
  return {
    instanceId: "enemy-0",
    defId: "test_enemy",
    nameKey: "test.enemy.name",
    maxHp: 30,
    hp: 30,
    block: 0,
    statuses: [],
    movesTaken: 0,
    intent: NOOP_MOVE,
    pattern: ["noop"],
    moves: { noop: NOOP_MOVE },
    ...overrides,
  };
}

export function makeState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    hero: makeHero(),
    enemies: [makeEnemy()],
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    energy: 3,
    maxEnergy: 3,
    turnNumber: 1,
    phase: "hero_turn",
    outcome: "en_cours",
    rng: createRng(1),
    cardCatalog: {},
    nextInstanceSeq: 0,
    ...overrides,
  };
}

export function heroCtx(overrides: Partial<EffectResolutionContext> = {}): EffectResolutionContext {
  return { actingSide: "hero", ...overrides };
}

export function enemyCtx(
  enemyInstanceId: string,
  overrides: Partial<EffectResolutionContext> = {},
): EffectResolutionContext {
  return { actingSide: enemyInstanceId, ...overrides };
}

export function makeCard(overrides: Partial<Card> & { readonly id: CardId }): Card {
  return {
    nameKey: `test.cards.${overrides.id}.name`,
    hero: "neutre",
    type: "attaque",
    rarity: "commune",
    cost: 1,
    effects: [],
    ...overrides,
  };
}

export function makeRunNode(overrides: Partial<RunNode> & { readonly id: string; readonly type: RunNodeType }): RunNode {
  return {
    floor: 0,
    edges: [],
    ...overrides,
  };
}

export function makeRunState(overrides: Partial<RunState> = {}): RunState {
  const map: RunMap = {
    actId: "acte_1",
    floorCount: 1,
    nodes: [makeRunNode({ id: "node-0", type: "combat", enemyIds: ["test_enemy"] })],
  };
  return {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp: 80,
    deck: [],
    noisettes: 0,
    map,
    currentNodeId: null,
    visitedNodeIds: [],
    phase: "carte",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: null,
    pendingShop: null,
    pendingEventId: null,
    rng: createRng(1),
    cardCatalog: {},
    enemyCatalog: {},
    eventCatalog: {},
    nextRunCardSeq: 0,
    ...overrides,
  };
}
