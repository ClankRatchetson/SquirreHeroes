import { createDexieStorageAdapter, type StorageAdapter } from "../../persistence";

/**
 * Instance unique du vrai adaptateur Dexie — racine de composition de l'UI,
 * délibérément en dehors de `/src/persistence` (qui reste
 * générique/injectable). C'est ce fichier que `run-store.ts`/`App.tsx`
 * importent, et le point que les tests ciblent via `vi.mock` pour ne
 * jamais toucher une vraie IndexedDB.
 */
export const storageAdapter: StorageAdapter = createDexieStorageAdapter();
