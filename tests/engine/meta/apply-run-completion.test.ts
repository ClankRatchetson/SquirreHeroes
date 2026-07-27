import { describe, expect, it } from "vitest";
import { applyRunCompletion, computeGlandsDorEarned } from "../../../src/engine/meta";
import { makeActConfig, makeMetaProgression, makeRunState } from "../helpers";

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
  it("victoire avec le boss de l'Acte I vaincu : incrémente totalVictories, marque actICompleted", () => {
    const meta = makeMetaProgression();
    const run = makeRunState({
      outcome: "victoire",
      visitedNodeIds: ["n0"],
      bossesDefeatedThisRun: ["test_enemy"], // acts[0] par défaut a bossEnemyIds: ["test_enemy"]
    });
    const next = applyRunCompletion(meta, run);
    expect(next.totalVictories).toBe(1);
    expect(next.totalDefeats).toBe(0);
    expect(next.actICompleted).toBe(true);
  });

  it("victoire SANS que le boss de l'Acte I ait été vaincu : ne marque pas actICompleted", () => {
    // Un run à plusieurs actes peut se terminer en victoire sur l'Acte II sans jamais re-décompter
    // le boss de l'Acte I dans CETTE run — mais ici on simule le cas où bossesDefeatedThisRun est
    // vide (ex. un contenu où acts[0] ne correspond à aucun boss réellement vaincu).
    const meta = makeMetaProgression();
    const run = makeRunState({ outcome: "victoire", visitedNodeIds: ["n0"], bossesDefeatedThisRun: [] });
    expect(applyRunCompletion(meta, run).actICompleted).toBe(false);
  });

  it("vaincre le boss d'un acte QUI N'EST PAS l'Acte I ne marque pas actICompleted", () => {
    const meta = makeMetaProgression();
    const run = makeRunState({
      outcome: "victoire",
      acts: [makeActConfig({ actId: "acte_1", bossEnemyIds: ["baronne_bec_de_fer"] })],
      bossesDefeatedThisRun: ["baron_griffu"], // boss d'un autre acte, jamais celui de acts[0]
    });
    expect(applyRunCompletion(meta, run).actICompleted).toBe(false);
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

  it("un boss vaincu puis une défaite plus loin dans la run compte quand même pour bossesDefeated", () => {
    const meta = makeMetaProgression();
    const run = makeRunState({ outcome: "defaite", bossesDefeatedThisRun: ["baronne_bec_de_fer"] });
    expect(applyRunCompletion(meta, run).bossesDefeated).toEqual(["baronne_bec_de_fer"]);
  });

  it("dédoublonne bossesDefeated à travers plusieurs runs sur le même boss", () => {
    const run = makeRunState({ outcome: "victoire", bossesDefeatedThisRun: ["baronne_bec_de_fer"] });
    const meta1 = applyRunCompletion(makeMetaProgression(), run);
    const meta2 = applyRunCompletion(meta1, run);
    expect(meta2.bossesDefeated).toEqual(["baronne_bec_de_fer"]);
  });

  it("bossesDefeatedThisRun avec plusieurs bosses (run multi-actes) crédite chacun", () => {
    const run = makeRunState({
      outcome: "victoire",
      bossesDefeatedThisRun: ["baronne_bec_de_fer", "baron_griffu"],
    });
    expect(applyRunCompletion(makeMetaProgression(), run).bossesDefeated).toEqual([
      "baronne_bec_de_fer",
      "baron_griffu",
    ]);
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
