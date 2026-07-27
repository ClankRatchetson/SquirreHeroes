import { INITIAL_META_PROGRESSION } from "../engine/meta";
import type { StorageAdapter } from "./storage-adapter";
import { CURRENT_SCHEMA_VERSION, type SaveFile } from "./save-file";
import { looksLikeMetaProgression, looksLikePersistedRunState, parseEnvelope } from "./validate";
import { runMigrations } from "./migrations";

const EMPTY_SAVE: SaveFile = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  currentRun: null,
  meta: INITIAL_META_PROGRESSION,
};

/**
 * Repli sûr à la moindre anomalie : démarrage à froid, enveloppe corrompue,
 * `schemaVersion` sans chemin de migration retombent sur `EMPTY_SAVE`. Un
 * `currentRun` corrompu (après migration) retombe sur `currentRun: null`
 * SANS jeter la `meta` déjà validement migrée — deux états indépendants
 * depuis la Phase 5, inutile de perdre l'un parce que l'autre est malformé.
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
    const meta = looksLikeMetaProgression(migrated.meta) ? migrated.meta : INITIAL_META_PROGRESSION;
    if (migrated.currentRun === null) {
      return { schemaVersion: migrated.schemaVersion, currentRun: null, meta };
    }
    if (!looksLikePersistedRunState(migrated.currentRun)) {
      return { schemaVersion: migrated.schemaVersion, currentRun: null, meta };
    }
    return { schemaVersion: migrated.schemaVersion, currentRun: migrated.currentRun, meta };
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
