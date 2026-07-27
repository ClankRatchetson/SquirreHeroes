import Dexie, { type Table } from "dexie";
import type { StorageAdapter } from "./storage-adapter";

const SAVE_SLOT_ID = "current";

interface SaveRow {
  readonly id: typeof SAVE_SLOT_ID;
  readonly payload: unknown;
}

/**
 * Une seule table, une seule ligne, clé fixe : il n'existe qu'un unique
 * emplacement de sauvegarde (aucune fonctionnalité multi-slots n'est prévue
 * aux specs). `db.version(1)` gouverne la STRUCTURE IndexedDB (table/index),
 * une notion orthogonale à `SaveFile.schemaVersion` qui gouverne la forme du
 * contenu JSON stocké dans `payload` (cf. `migrations.ts`) — une seule
 * table/une seule ligne ne nécessitera vraisemblablement jamais de bump de
 * `db.version()`, alors que `schemaVersion` évoluera à chaque phase qui
 * touche `SaveFile`.
 */
class SquirrelHeroesDb extends Dexie {
  saveSlot!: Table<SaveRow, string>;

  constructor() {
    super("squirrel-heroes");
    this.version(1).stores({ saveSlot: "id" });
  }
}

export function createDexieStorageAdapter(): StorageAdapter {
  const db = new SquirrelHeroesDb();
  return {
    async load() {
      const row = await db.saveSlot.get(SAVE_SLOT_ID);
      return row?.payload;
    },
    async save(data) {
      await db.saveSlot.put({ id: SAVE_SLOT_ID, payload: data });
    },
    async clear() {
      await db.saveSlot.delete(SAVE_SLOT_ID);
    },
  };
}
