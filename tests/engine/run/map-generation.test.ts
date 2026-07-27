import { describe, expect, it } from "vitest";
import { generateMap, type MapGenerationPools } from "../../../src/engine/run/map-generation";
import { FLOOR_COUNT, ELITE_MIN_FLOOR } from "../../../src/engine/run/constants";
import { createRng } from "../../../src/engine/rng";

const POOLS: MapGenerationPools = {
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
  eventIds: ["noyer_ancestral", "fontaine_moussue", "marchand_ambulant"],
};

describe("generateMap", () => {
  it("est déterministe : la même seed produit la même carte", () => {
    const [mapA] = generateMap(createRng(42), POOLS);
    const [mapB] = generateMap(createRng(42), POOLS);
    expect(mapA).toEqual(mapB);
  });

  it("le floor 0 est un unique nœud combat", () => {
    const [map] = generateMap(createRng(1), POOLS);
    const floor0 = map.nodes.filter((n) => n.floor === 0);
    expect(floor0).toHaveLength(1);
    expect(floor0[0]?.type).toBe("combat");
  });

  it("le dernier floor est un unique nœud boss", () => {
    const [map] = generateMap(createRng(1), POOLS);
    const lastFloor = map.nodes.filter((n) => n.floor === FLOOR_COUNT - 1);
    expect(lastFloor).toHaveLength(1);
    expect(lastFloor[0]?.type).toBe("boss");
    expect(lastFloor[0]?.enemyIds).toEqual(["baronne_bec_de_fer"]);
  });

  it("aucun nœud élite avant ELITE_MIN_FLOOR, sur plusieurs seeds", () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const [map] = generateMap(createRng(seed), POOLS);
      const earlyElites = map.nodes.filter((n) => n.floor < ELITE_MIN_FLOOR && n.type === "elite");
      expect(earlyElites).toHaveLength(0);
    }
  });

  it("tout nœud de floor > 0 a au moins une arête entrante, sur plusieurs seeds", () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const [map] = generateMap(createRng(seed), POOLS);
      for (let floor = 1; floor < FLOOR_COUNT; floor += 1) {
        const nodesAtFloor = map.nodes.filter((n) => n.floor === floor);
        const allEdgesIntoFloor = map.nodes.filter((n) => n.floor === floor - 1).flatMap((n) => n.edges);
        for (const node of nodesAtFloor) {
          expect(allEdgesIntoFloor).toContain(node.id);
        }
      }
    }
  });

  it("garantit au moins un feu de camp au floor prévu, sur plusieurs seeds", () => {
    for (let seed = 0; seed < 30; seed += 1) {
      const [map] = generateMap(createRng(seed), POOLS);
      const campfireFloor = map.nodes.filter((n) => n.floor === FLOOR_COUNT - 3);
      expect(campfireFloor.some((n) => n.type === "feu_de_camp")).toBe(true);
    }
  });

  it("le dernier floor n'a aucune arête sortante", () => {
    const [map] = generateMap(createRng(5), POOLS);
    const lastFloor = map.nodes.filter((n) => n.floor === FLOOR_COUNT - 1);
    expect(lastFloor.every((n) => n.edges.length === 0)).toBe(true);
  });
});
