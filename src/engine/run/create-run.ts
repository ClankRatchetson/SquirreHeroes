import type { Card, CardId, EnemyDefinition, EnemyId, EventDefinition, HeroDefinition, RunDeckEntry, RunState } from "../types";
import { createRng } from "../rng";
import { generateMap, type MapGenerationPools } from "./map-generation";

export interface CreateRunParams {
  readonly hero: HeroDefinition;
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly enemyCatalog: Readonly<Record<EnemyId, EnemyDefinition>>;
  readonly eventCatalog: Readonly<Record<string, EventDefinition>>;
  readonly commonEnemyIds: readonly EnemyId[];
  readonly eliteEnemyIds: readonly EnemyId[];
  readonly bossEnemyIds: readonly EnemyId[];
  readonly seed: number;
}

export function createRun(params: CreateRunParams): RunState {
  const rng0 = createRng(params.seed);
  const pools: MapGenerationPools = {
    commonEnemyIds: params.commonEnemyIds,
    eliteEnemyIds: params.eliteEnemyIds,
    bossEnemyIds: params.bossEnemyIds,
    eventIds: Object.keys(params.eventCatalog),
  };
  const [map, rng1] = generateMap(rng0, pools);

  let nextRunCardSeq = 0;
  const deck: RunDeckEntry[] = params.hero.startingDeck.map((cardId) => {
    const entry: RunDeckEntry = { runCardId: `run-card-${String(nextRunCardSeq)}`, cardId, upgraded: false };
    nextRunCardSeq += 1;
    return entry;
  });

  return {
    heroId: params.hero.id,
    heroMaxHp: params.hero.maxHp,
    heroHp: params.hero.maxHp,
    deck,
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
    rng: rng1,
    cardCatalog: params.cardCatalog,
    enemyCatalog: params.enemyCatalog,
    eventCatalog: params.eventCatalog,
    nextRunCardSeq,
  };
}
