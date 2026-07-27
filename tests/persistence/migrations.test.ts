import { describe, expect, it } from "vitest";
import { MIGRATIONS, runMigrations } from "../../src/persistence/migrations";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence/save-file";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { stripRunState } from "../../src/persistence/serialize";
import { makeRunState, makeState } from "../engine/helpers";

describe("migrations", () => {
  it("CURRENT_SCHEMA_VERSION vaut 4 (Phase 7 lot 4 — Acte II + transition multi-actes)", () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(4);
  });

  it("MIGRATIONS contient l'historique complet du projet, depuis v1", () => {
    expect(MIGRATIONS).toHaveLength(3);
    expect(MIGRATIONS[0]?.fromVersion).toBe(1);
    expect(MIGRATIONS[1]?.fromVersion).toBe(2);
    expect(MIGRATIONS[2]?.fromVersion).toBe(3);
  });

  it("runMigrations retourne l'enveloppe inchangée si déjà à la version courante", () => {
    const envelope = { schemaVersion: 4, currentRun: null, meta: INITIAL_META_PROGRESSION };
    expect(runMigrations(envelope)).toEqual(envelope);
  });

  it("runMigrations lève si aucun chemin de migration n'existe depuis une version antérieure", () => {
    expect(() => runMigrations({ schemaVersion: 0, currentRun: null })).toThrow();
  });

  it("runMigrations lève sur une sauvegarde annonçant une version future inconnue", () => {
    expect(() => runMigrations({ schemaVersion: 5, currentRun: null })).toThrow();
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
    // MIGRATIONS[0] (v1->v2) suivi de MIGRATIONS[1] (v2->v3) s'enchaînent — on inspecte
    // uniquement la forme v2 intermédiaire, sans encore invoquer familiarId/familiarPassive.
    const migration = MIGRATIONS[0];
    const migratedToV2 = migration?.migrate({ schemaVersion: 1, currentRun: v1CurrentRun });

    expect(migratedToV2?.schemaVersion).toBe(2);
    expect(migratedToV2?.meta).toEqual(INITIAL_META_PROGRESSION);
    expect(migratedToV2?.currentRun).toEqual({ ...v1CurrentRun, noisettesBonusPerCombat: 0 });
  });

  it("migre une authentique sauvegarde v2 (Phase 5, sans familiarId/familiarPassive) vers v3 — sans combat en cours", () => {
    const strippedRun = stripRunState(makeRunState({ pendingCombat: null }));
    const v2CurrentRun: Record<string, unknown> = { ...strippedRun };
    delete v2CurrentRun.familiarId;
    delete v2CurrentRun.familiarPassive;
    const v2Envelope = { schemaVersion: 2, currentRun: v2CurrentRun, meta: INITIAL_META_PROGRESSION };

    // MIGRATIONS[1] (v2->v3) isolé — `runMigrations` enchaînerait jusqu'à CURRENT_SCHEMA_VERSION.
    const migration = MIGRATIONS[1];
    const migrated = migration?.migrate(v2Envelope);

    expect(migrated?.schemaVersion).toBe(3);
    expect((migrated?.currentRun as { familiarId: unknown }).familiarId).toBeNull();
    expect((migrated?.currentRun as { pendingCombat: unknown }).pendingCombat).toBeNull();
  });

  it("migre une authentique sauvegarde v2 vers v3 — avec un combat en cours", () => {
    const combatState = makeState();
    const strippedRun = stripRunState(makeRunState({ pendingCombat: combatState }));
    const v2CurrentRun: Record<string, unknown> = { ...strippedRun };
    delete v2CurrentRun.familiarId;
    delete v2CurrentRun.familiarPassive;
    const v2PendingCombat = v2CurrentRun.pendingCombat as Record<string, unknown>;
    delete v2PendingCombat.familiarPassive;
    const v2Envelope = { schemaVersion: 2, currentRun: v2CurrentRun, meta: INITIAL_META_PROGRESSION };

    // MIGRATIONS[1] (v2->v3) isolé — `runMigrations` enchaînerait jusqu'à CURRENT_SCHEMA_VERSION.
    const migration = MIGRATIONS[1];
    const migrated = migration?.migrate(v2Envelope);

    expect(migrated?.schemaVersion).toBe(3);
    const migratedRun = migrated?.currentRun as { familiarId: unknown; pendingCombat: Record<string, unknown> };
    expect(migratedRun.familiarId).toBeNull();
    expect(migratedRun.pendingCombat.familiarPassive).toBeNull();
  });

  it("migre une authentique sauvegarde v3 (Phase 7 lot 3, sans acts/actIndex/bossesDefeatedThisRun/pendingActTransition) vers v4", () => {
    const strippedRun = stripRunState(makeRunState({ pendingCombat: null }));
    const v3CurrentRun: Record<string, unknown> = { ...strippedRun };
    delete v3CurrentRun.acts;
    delete v3CurrentRun.actIndex;
    delete v3CurrentRun.bossesDefeatedThisRun;
    delete v3CurrentRun.pendingActTransition;
    const v3Envelope = { schemaVersion: 3, currentRun: v3CurrentRun, meta: INITIAL_META_PROGRESSION };

    const migrated = runMigrations(v3Envelope);

    expect(migrated.schemaVersion).toBe(4);
    const migratedRun = migrated.currentRun as {
      acts: unknown;
      actIndex: unknown;
      bossesDefeatedThisRun: unknown;
      pendingActTransition: unknown;
    };
    expect(migratedRun.acts).toEqual([
      {
        actId: "acte_1",
        commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
        eliteEnemyIds: ["merle_mercenaire"],
        bossEnemyIds: ["baronne_bec_de_fer"],
      },
    ]);
    expect(migratedRun.actIndex).toBe(0);
    expect(migratedRun.bossesDefeatedThisRun).toEqual([]);
    expect(migratedRun.pendingActTransition).toBe(false);
  });
});
