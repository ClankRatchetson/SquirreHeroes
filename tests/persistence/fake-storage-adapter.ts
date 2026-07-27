import type { StorageAdapter } from "../../src/persistence";

/** Faux adaptateur en mémoire — aucune dépendance npm nouvelle, pas d'IndexedDB requis. */
export function makeFakeStorageAdapter(initial?: unknown): StorageAdapter {
  let stored: unknown = initial;
  return {
    load: () => Promise.resolve(stored),
    save: (data) => {
      stored = data;
      return Promise.resolve();
    },
    clear: () => {
      stored = undefined;
      return Promise.resolve();
    },
  };
}
