import type { Card, CardId, CombatState, EnemyDefinition, EnemyId, EventDefinition, RunState } from "../engine/types";

/** Gouverne la forme du JSON stocké — orthogonal à la structure IndexedDB (cf. `dexie-adapter.ts`). */
export const CURRENT_SCHEMA_VERSION = 1;

export type PersistedCombatState = Omit<CombatState, "cardCatalog">;

/**
 * `RunState` moins les catalogues de contenu injectés (jamais sérialisés —
 * ils gèleraient une version du contenu dans la sauvegarde) et moins le
 * `pendingCombat` complet, remplacé par sa propre version dépouillée.
 */
export interface PersistedRunState
  extends Omit<RunState, "cardCatalog" | "enemyCatalog" | "eventCatalog" | "pendingCombat"> {
  readonly pendingCombat: PersistedCombatState | null;
}

/**
 * Sans `meta`/`settings` (§7 des specs) : ni `MetaProgression` ni un écran
 * de réglages n'existent encore (Phase 5 pour la première, aucune phase
 * prévue pour la seconde avant la v1.0) — les ajouter maintenant serait de
 * l'anticipation prématurée. La Phase 5 fera passer `schemaVersion` à 2 et
 * ajoutera `meta` via une vraie migration.
 */
export interface SaveFile {
  readonly schemaVersion: number;
  readonly currentRun: PersistedRunState | null;
}

/** Catalogues de contenu vivants, à réinjecter dans un `PersistedRunState` chargé — jamais stockés tels quels. */
export interface RunContentCatalogs {
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly enemyCatalog: Readonly<Record<EnemyId, EnemyDefinition>>;
  readonly eventCatalog: Readonly<Record<string, EventDefinition>>;
}
