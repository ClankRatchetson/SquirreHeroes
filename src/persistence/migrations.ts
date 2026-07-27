import { INITIAL_META_PROGRESSION } from "../engine/meta";
import { CURRENT_SCHEMA_VERSION } from "./save-file";

export interface Migration {
  readonly fromVersion: number;
  readonly migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Première vraie migration du projet : v1 (Phase 4, pas de `meta`, pas de
 * `noisettesBonusPerCombat` sur `currentRun`) → v2 (Phase 5). Une run en
 * cours reçoit `noisettesBonusPerCombat: 0` (comportement inchangé pour une
 * sauvegarde antérieure à l'existence du bonus) ; `meta` est initialisée à
 * `INITIAL_META_PROGRESSION`.
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    fromVersion: 1,
    migrate: (data) => ({
      schemaVersion: 2,
      currentRun:
        data.currentRun === null
          ? null
          : { ...(data.currentRun as Record<string, unknown>), noisettesBonusPerCombat: 0 },
      meta: INITIAL_META_PROGRESSION,
    }),
  },
];

export interface MigratableEnvelope {
  readonly schemaVersion: number;
  readonly currentRun: unknown;
  readonly meta?: unknown;
}

/**
 * Applique séquentiellement `MIGRATIONS` jusqu'à `CURRENT_SCHEMA_VERSION` ;
 * lève si aucun chemin n'existe depuis une version antérieure, ou si la
 * sauvegarde annonce une version PLUS RÉCENTE que celle connue par ce
 * build (donnée écrite par une version future de l'app — sa forme nous est
 * inconnue, mieux vaut échouer explicitement que la faire silencieusement
 * transiter telle quelle).
 */
export function runMigrations(envelope: MigratableEnvelope): MigratableEnvelope {
  if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Sauvegarde d'une version future non prise en charge : schemaVersion=${String(envelope.schemaVersion)}.`);
  }
  let current = envelope;
  while (current.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migration = MIGRATIONS.find((m) => m.fromVersion === current.schemaVersion);
    if (!migration) {
      throw new Error(`Aucune migration depuis schemaVersion=${String(current.schemaVersion)}.`);
    }
    const migrated = migration.migrate({
      schemaVersion: current.schemaVersion,
      currentRun: current.currentRun,
      meta: current.meta,
    });
    current = {
      schemaVersion: migrated.schemaVersion as number,
      currentRun: migrated.currentRun,
      meta: migrated.meta,
    };
  }
  return current;
}
