import type { MetaProgression } from "../../engine/meta";
import type { RunState } from "../../engine/types";
import { CURRENT_SCHEMA_VERSION, saveSaveFile, stripRunState } from "../../persistence";
import { storageAdapter } from "./storage";

/**
 * Point d'écriture unique du `SaveFile` — pris en paramètres, sans import
 * d'aucun store Zustand, pour que `run-store.ts` et `meta-store.ts`
 * (Phase 5) puissent tous deux l'appeler sans créer de cycle entre eux.
 */
export function persistCurrentSaveFile(runState: RunState | null, meta: MetaProgression): void {
  void saveSaveFile(storageAdapter, {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    currentRun: runState ? stripRunState(runState) : null,
    meta,
  });
}
