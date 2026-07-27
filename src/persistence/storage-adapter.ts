/**
 * Seam d'injection entre la logique de sauvegarde (validation, migrations,
 * strip/reattach) et le support de stockage réel. N'importe jamais Dexie —
 * c'est ce qui rend tout le reste de `/src/persistence` testable sans
 * IndexedDB (un faux adaptateur en mémoire suffit en test).
 */
export interface StorageAdapter {
  /** `undefined` = rien en base (démarrage à froid). */
  load(): Promise<unknown>;
  save(data: unknown): Promise<void>;
  clear(): Promise<void>;
}
