import type { EnemyId, EventDefinition, RunActConfig, RunMap, RunNode, RunNodeType } from "../types";
import { nextInt, shuffle, type RngState } from "../rng";
import {
  ELITE_MIN_FLOOR,
  FLOOR_COUNT,
  GUARANTEED_CAMPFIRE_FLOOR,
  NODES_PER_FLOOR_MAX,
  NODES_PER_FLOOR_MIN,
  NODE_TYPE_WEIGHTS,
  type WeightedNodeType,
} from "./constants";

export interface MapGenerationPools {
  readonly commonEnemyIds: readonly EnemyId[];
  readonly eliteEnemyIds: readonly EnemyId[];
  readonly bossEnemyIds: readonly EnemyId[];
  readonly eventIds: readonly string[];
}

/** Dérive les pools d'un acte à partir de sa config figée sur `RunState.acts` — même pool d'événements pour tous les actes (non scopé par acte, §3.5 des specs ne le demande pas). */
export function poolsForAct(
  act: RunActConfig,
  eventCatalog: Readonly<Record<string, EventDefinition>>,
): MapGenerationPools {
  return {
    commonEnemyIds: act.commonEnemyIds,
    eliteEnemyIds: act.eliteEnemyIds,
    bossEnemyIds: act.bossEnemyIds,
    eventIds: Object.keys(eventCatalog),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pickEnemies(
  rng: RngState,
  pool: readonly EnemyId[],
  min: number,
  max: number,
): readonly [readonly EnemyId[], RngState] {
  const [countRoll, rngAfterCount] = nextInt(rng, max - min + 1);
  const count = Math.min(min + countRoll, pool.length);
  const [shuffled, rngAfterShuffle] = shuffle(rngAfterCount, pool);
  return [shuffled.slice(0, count), rngAfterShuffle];
}

function drawWeightedNodeType(rng: RngState, floor: number): readonly [WeightedNodeType, RngState] {
  const entries = (Object.entries(NODE_TYPE_WEIGHTS) as [WeightedNodeType, number][]).filter(
    ([type]) => floor >= ELITE_MIN_FLOOR || type !== "elite",
  );
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const [roll, nextRng] = nextInt(rng, total);
  let cumulative = 0;
  for (const [type, weight] of entries) {
    cumulative += weight;
    if (roll < cumulative) {
      return [type, nextRng];
    }
  }
  const fallback = entries[0];
  return [fallback ? fallback[0] : "combat", nextRng];
}

function buildIntermediateNode(
  rng: RngState,
  id: string,
  floor: number,
  type: WeightedNodeType,
  pools: MapGenerationPools,
): readonly [RunNode, RngState] {
  if (type === "combat") {
    const [enemyIds, nextRng] = pickEnemies(rng, pools.commonEnemyIds, 1, 2);
    return [{ id, floor, type, enemyIds, edges: [] }, nextRng];
  }
  if (type === "elite") {
    const [enemyIds, nextRng] = pickEnemies(rng, pools.eliteEnemyIds, 1, 1);
    return [{ id, floor, type, enemyIds, edges: [] }, nextRng];
  }
  if (type === "evenement") {
    const [index, nextRng] = nextInt(rng, pools.eventIds.length);
    const eventId = pools.eventIds[index];
    if (eventId === undefined) {
      throw new Error("Contenu manquant : aucun événement disponible pour générer la carte.");
    }
    return [{ id, floor, type, eventId, edges: [] }, nextRng];
  }
  return [{ id, floor, type, edges: [] }, rng];
}

/**
 * Chaque nœud de `fromIds` tire 1-2 arêtes vers des positions voisines de
 * `toIds` (proportionnelles à sa position), puis une passe de garantie
 * assure qu'aucun nœud de `toIds` n'est orphelin. Construit les arêtes dans
 * une `Map<string, string[]>` mutable pendant l'algorithme — les `RunNode`
 * `readonly` ne sont assemblés qu'à la toute fin par l'appelant.
 */
function wireEdges(
  rng: RngState,
  fromIds: readonly string[],
  toIds: readonly string[],
): readonly [Map<string, string[]>, RngState] {
  const edgesByFromId = new Map<string, string[]>();
  for (const id of fromIds) {
    edgesByFromId.set(id, []);
  }
  let currentRng = rng;

  fromIds.forEach((fromId, i) => {
    const proportion = fromIds.length === 1 ? 0 : i / (fromIds.length - 1);
    const targetIndex = Math.round(proportion * (toIds.length - 1));
    const [extraEdge, rngAfterCount] = nextInt(currentRng, 2);
    currentRng = rngAfterCount;
    const desiredCount = extraEdge + 1;

    const candidateIndexes = new Set<number>([clamp(targetIndex, 0, toIds.length - 1)]);
    let attempt = 0;
    while (candidateIndexes.size < desiredCount && attempt < 10) {
      const offset = (attempt % 2 === 0 ? 1 : -1) * Math.ceil((attempt + 1) / 2);
      candidateIndexes.add(clamp(targetIndex + offset, 0, toIds.length - 1));
      attempt += 1;
    }

    const edges = edgesByFromId.get(fromId) as string[];
    for (const idx of candidateIndexes) {
      const toId = toIds[idx];
      if (toId !== undefined && !edges.includes(toId)) {
        edges.push(toId);
      }
    }
  });

  toIds.forEach((toId, toIndex) => {
    const hasIncoming = [...edgesByFromId.values()].some((edges) => edges.includes(toId));
    if (hasIncoming) {
      return;
    }
    const proportion = toIds.length === 1 ? 0 : toIndex / (toIds.length - 1);
    const nearestFromIndex = clamp(Math.round(proportion * (fromIds.length - 1)), 0, fromIds.length - 1);
    const nearestFromId = fromIds[nearestFromIndex];
    if (nearestFromId !== undefined) {
      const edges = edgesByFromId.get(nearestFromId) as string[];
      if (!edges.includes(toId)) {
        edges.push(toId);
      }
    }
  });

  return [edgesByFromId, currentRng];
}

/** Génère la carte à embranchements d'UN acte, pilotée à 100% par le PRNG seedé — l'acte est identifié par `actId`, indépendant du contenu des pools. */
export function generateMap(rng: RngState, pools: MapGenerationPools, actId: string): readonly [RunMap, RngState] {
  let currentRng = rng;
  let nodeSeq = 0;
  const floors: RunNode[][] = [];

  {
    const [enemyIds, rngAfter] = pickEnemies(currentRng, pools.commonEnemyIds, 1, 2);
    currentRng = rngAfter;
    const node: RunNode = { id: `node-${String(nodeSeq)}`, floor: 0, type: "combat", enemyIds, edges: [] };
    nodeSeq += 1;
    floors.push([node]);
  }

  for (let floor = 1; floor <= FLOOR_COUNT - 2; floor += 1) {
    const [countRoll, rngAfterCount] = nextInt(currentRng, NODES_PER_FLOOR_MAX - NODES_PER_FLOOR_MIN + 1);
    currentRng = rngAfterCount;
    const nodeCount = NODES_PER_FLOOR_MIN + countRoll;

    const nodes: RunNode[] = [];
    for (let i = 0; i < nodeCount; i += 1) {
      const [type, rngAfterType] = drawWeightedNodeType(currentRng, floor);
      currentRng = rngAfterType;
      const [node, rngAfterNode] = buildIntermediateNode(currentRng, `node-${String(nodeSeq)}`, floor, type, pools);
      currentRng = rngAfterNode;
      nodes.push(node);
      nodeSeq += 1;
    }

    if (floor === GUARANTEED_CAMPFIRE_FLOOR && !nodes.some((n) => n.type === "feu_de_camp")) {
      const first = nodes[0] as RunNode;
      nodes[0] = { id: first.id, floor, type: "feu_de_camp", edges: [] };
    }

    floors.push(nodes);
  }

  {
    const bossFloor = FLOOR_COUNT - 1;
    const node: RunNode = {
      id: `node-${String(nodeSeq)}`,
      floor: bossFloor,
      type: "boss" satisfies RunNodeType,
      enemyIds: pools.bossEnemyIds,
      edges: [],
    };
    nodeSeq += 1;
    floors.push([node]);
  }

  const wiredFloors = floors.map((floorNodes) => [...floorNodes]);
  for (let floor = 0; floor < wiredFloors.length - 1; floor += 1) {
    const fromNodes = wiredFloors[floor] as RunNode[];
    const toNodes = wiredFloors[floor + 1] as RunNode[];
    const [edgesMap, rngAfterWire] = wireEdges(
      currentRng,
      fromNodes.map((n) => n.id),
      toNodes.map((n) => n.id),
    );
    currentRng = rngAfterWire;
    wiredFloors[floor] = fromNodes.map((n) => ({ ...n, edges: edgesMap.get(n.id) ?? [] }));
  }

  const map: RunMap = { actId, floorCount: FLOOR_COUNT, nodes: wiredFloors.flat() };
  return [map, currentRng];
}
