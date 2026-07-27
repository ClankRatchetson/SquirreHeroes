import type { StorageAdapter } from "./storage-adapter";
import { CURRENT_SCHEMA_VERSION, type SaveFile } from "./save-file";
import { looksLikePersistedRunState, parseEnvelope } from "./validate";
import { runMigrations } from "./migrations";

const EMPTY_SAVE: SaveFile = { schemaVersion: CURRENT_SCHEMA_VERSION, currentRun: null };

/**
 * Repli sur `EMPTY_SAVE` à la moindre anomalie (pas de préservation
 * partielle : rien d'autre à sauver dans l'enveloppe tant que `meta`
 * n'existe pas, cf. Phase 5) — démarrage à froid, enveloppe corrompue,
 * `schemaVersion` sans chemin de migration, ou `currentRun` dont la forme
 * ne correspond pas à ce qu'on attend produisent tous le même résultat sûr.
 */
export async function loadSaveFile(adapter: StorageAdapter): Promise<SaveFile> {
  try {
    const raw = await adapter.load();
    if (raw === undefined) {
      return EMPTY_SAVE;
    }
    const envelope = parseEnvelope(raw);
    if (!envelope.success) {
      return EMPTY_SAVE;
    }
    const migrated = runMigrations(envelope.data);
    if (migrated.currentRun === null) {
      return { schemaVersion: migrated.schemaVersion, currentRun: null };
    }
    if (!looksLikePersistedRunState(migrated.currentRun)) {
      return EMPTY_SAVE;
    }
    return { schemaVersion: migrated.schemaVersion, currentRun: migrated.currentRun };
  } catch {
    return EMPTY_SAVE;
  }
}

/** Un échec d'autosave ne doit jamais interrompre la partie ; la prochaine sauvegarde réussie remplacera celle-ci. */
export async function saveSaveFile(adapter: StorageAdapter, saveFile: SaveFile): Promise<void> {
  try {
    await adapter.save(saveFile);
  } catch {
    // Volontairement silencieux — cf. commentaire ci-dessus.
  }
}

export async function clearSaveFile(adapter: StorageAdapter): Promise<void> {
  await adapter.clear();
}
