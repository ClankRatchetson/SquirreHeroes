import { describe, expect, it } from "vitest";
import { MIGRATIONS, runMigrations } from "../../src/persistence/migrations";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence/save-file";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { stripRunState } from "../../src/persistence/serialize";
import { makeRunState } from "../engine/helpers";

describe("migrations", () => {
  it("CURRENT_SCHEMA_VERSION vaut 2 (Phase 5 — ajout de meta)", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(2);
  });

  it("MIGRATIONS contient la première vraie migration du projet, depuis v1", () => {
    expect(MIGRATIONS).toHaveLength(1);
    expect(MIGRATIONS[0]?.fromVersion).toBe(1);
  });

  it("runMigrations retourne l'enveloppe inchangée si déjà à la version courante", () => {
    const envelope = { schemaVersion: 2, currentRun: null, meta: INITIAL_META_PROGRESSION };
    expect(runMigrations(envelope)).toEqual(envelope);
  });

  it("runMigrations lève si aucun chemin de migration n'existe depuis une version antérieure", () => {
    expect(() => runMigrations({ schemaVersion: 0, currentRun: null })).toThrow();
  });

  it("runMigrations lève sur une sauvegarde annonçant une version future inconnue", () => {
    expect(() => runMigrations({ schemaVersion: 3, currentRun: null })).toThrow();
  });

  it("migre une authentique sauvegarde v1 (Phase 4 : sans meta, sans noisettesBonusPerCombat) vers v2", () => {
    const strippedRun = stripRunState(makeRunState({ noisettes: 42 }));
    // Reconstruction explicite d'un `currentRun` v1 authentique — champ par champ, sans
    // `noisettesBonusPerCombat` (qui n'existait pas avant la Phase 5), plutôt qu'un spread
    // qui l'inclurait silencieusement.
    const v1CurrentRun: Record<string, unknown> = {
      heroId: strippedRun.heroId,
      heroMaxHp: strippedRun.heroMaxHp,
      heroHp: strippedRun.heroHp,
      deck: strippedRun.deck,
      noisettes: strippedRun.noisettes,
      map: strippedRun.map,
      currentNodeId: strippedRun.currentNodeId,
      visitedNodeIds: strippedRun.visitedNodeIds,
      phase: strippedRun.phase,
      outcome: strippedRun.outcome,
      pendingCombat: strippedRun.pendingCombat,
      pendingReward: strippedRun.pendingReward,
      pendingShop: strippedRun.pendingShop,
      pendingEventId: strippedRun.pendingEventId,
      rng: strippedRun.rng,
      nextRunCardSeq: strippedRun.nextRunCardSeq,
    };
    const v1Envelope = { schemaVersion: 1, currentRun: v1CurrentRun };

    const migrated = runMigrations(v1Envelope);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.meta).toEqual(INITIAL_META_PROGRESSION);
    expect(migrated.currentRun).toEqual({ ...v1CurrentRun, noisettesBonusPerCombat: 0 });
  });
});
