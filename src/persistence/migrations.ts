import { CURRENT_SCHEMA_VERSION } from "./save-file";

export interface Migration {
  readonly fromVersion: number;
  readonly migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Vide en Phase 4 : `schemaVersion=1` est littéralement la toute première
 * version jamais persistée par ce projet — il n'existe logiquement encore
 * aucune version antérieure à migrer depuis. Cette machinerie (ce tableau +
 * `runMigrations`) est prête à recevoir sa première entrée réelle en
 * Phase 5 (ajout de `meta`), avec son vrai test de chargement d'une
 * sauvegarde v1 authentique.
 */
export const MIGRATIONS: readonly Migration[] = [];

export interface MigratableEnvelope {
  readonly schemaVersion: number;
  readonly currentRun: unknown;
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
    const migrated = migration.migrate({ schemaVersion: current.schemaVersion, currentRun: current.currentRun });
    current = { schemaVersion: migrated.schemaVersion as number, currentRun: migrated.currentRun };
  }
  return current;
}
