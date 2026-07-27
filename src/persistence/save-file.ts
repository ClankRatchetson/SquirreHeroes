import type { Card, CardId, CombatState, EnemyDefinition, EnemyId, EventDefinition, RunState } from "../engine/types";
import type { MetaProgression } from "../engine/meta";

/** Gouverne la forme du JSON stocké — orthogonal à la structure IndexedDB (cf. `dexie-adapter.ts`). */
export const CURRENT_SCHEMA_VERSION = 3;

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
 * `meta` (Phase 5) : pas de variante "Persisted" nécessaire —
 * `MetaProgression` ne contient aucun catalogue de contenu injecté, elle se
 * sérialise telle quelle. Sans `settings` : aucun écran de réglages
 * n'existe, l'ajouter maintenant serait de l'anticipation prématurée.
 */
export interface SaveFile {
  readonly schemaVersion: number;
  readonly currentRun: PersistedRunState | null;
  readonly meta: MetaProgression;
}

/** Catalogues de contenu vivants, à réinjecter dans un `PersistedRunState` chargé — jamais stockés tels quels. */
export interface RunContentCatalogs {
  readonly cardCatalog: Readonly<Record<CardId, Card>>;
  readonly enemyCatalog: Readonly<Record<EnemyId, EnemyDefinition>>;
  readonly eventCatalog: Readonly<Record<string, EventDefinition>>;
}
