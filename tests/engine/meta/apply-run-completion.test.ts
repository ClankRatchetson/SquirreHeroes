import { describe, expect, it } from "vitest";
import { applyRunCompletion, computeGlandsDorEarned } from "../../../src/engine/meta";
import { makeMetaProgression, makeRunNode, makeRunState } from "../helpers";

describe("computeGlandsDorEarned", () => {
  it("vaut visitedNodeIds.length * 5", () => {
    const run = makeRunState({ visitedNodeIds: ["n0", "n1", "n2"] });
    expect(computeGlandsDorEarned(run)).toBe(15);
  });

  it("vaut 0 si aucun nœud visité", () => {
    const run = makeRunState({ visitedNodeIds: [] });
    expect(computeGlandsDorEarned(run)).toBe(0);
  });
});

describe("applyRunCompletion", () => {
  it("victoire : incrémente totalVictories, marque actICompleted", () => {
    const meta = makeMetaProgression();
    const run = makeRunState({ outcome: "victoire", visitedNodeIds: ["n0"] });
    const next = applyRunCompletion(meta, run);
    expect(next.totalVictories).toBe(1);
    expect(next.totalDefeats).toBe(0);
    expect(next.actICompleted).toBe(true);
  });

  it("défaite : incrémente totalDefeats, ne touche pas actICompleted", () => {
    const meta = makeMetaProgression();
    const run = makeRunState({ outcome: "defaite", visitedNodeIds: ["n0"] });
    const next = applyRunCompletion(meta, run);
    expect(next.totalDefeats).toBe(1);
    expect(next.totalVictories).toBe(0);
    expect(next.actICompleted).toBe(false);
  });

  it("actICompleted reste vrai une fois acquis, même après une défaite ultérieure", () => {
    const meta = makeMetaProgression({ actICompleted: true });
    const run = makeRunState({ outcome: "defaite", visitedNodeIds: [] });
    expect(applyRunCompletion(meta, run).actICompleted).toBe(true);
  });

  it("dédoublonne bossesDefeated à travers plusieurs victoires sur le même boss", () => {
    const bossNode = makeRunNode({ id: "boss0", type: "boss", floor: 8, enemyIds: ["baronne_bec_de_fer"] });
    const run = makeRunState({
      outcome: "victoire",
      visitedNodeIds: ["boss0"],
      map: { actId: "acte_1", floorCount: 9, nodes: [bossNode] },
    });
    const meta1 = applyRunCompletion(makeMetaProgression(), run);
    const meta2 = applyRunCompletion(meta1, run);
    expect(meta2.bossesDefeated).toEqual(["baronne_bec_de_fer"]);
  });

  it("ne touche jamais totalRunsStarted", () => {
    const meta = makeMetaProgression({ totalRunsStarted: 7 });
    const run = makeRunState({ outcome: "victoire" });
    expect(applyRunCompletion(meta, run).totalRunsStarted).toBe(7);
  });

  it("crédite les Glands d'Or gagnés au solde existant", () => {
    const meta = makeMetaProgression({ glandsDor: 10 });
    const run = makeRunState({ outcome: "defaite", visitedNodeIds: ["n0", "n1"] });
    expect(applyRunCompletion(meta, run).glandsDor).toBe(20);
  });
});
