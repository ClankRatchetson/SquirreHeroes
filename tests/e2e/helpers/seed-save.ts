import type { Page } from "@playwright/test";
import { CURRENT_SCHEMA_VERSION } from "../../../src/persistence";
import { INITIAL_META_PROGRESSION } from "../../../src/engine/meta";
import type { MetaProgression } from "../../../src/engine/meta";

/**
 * Amorçage direct d'IndexedDB avec un `currentRun` déjà dans la phase de
 * run voulue — évite de faire jouer un bot à travers un tirage de carte
 * RNG-dépendant pour atteindre un état rare (boutique/feu de camp/
 * événement/boss final), même motivation et même technique que
 * `act-transition.spec.ts`/`hero-select.spec.ts`/`meta-progression.spec.ts`
 * (dupliquée dans chacun avant extraction ici, une fois un 4ᵉ+5ᵉ site
 * d'appel rendus la duplication moins défendable qu'un partage).
 * `currentRun` est volontairement `Record<string, unknown>` : c'est du
 * JSON brut écrit tel quel dans le store, pas une valeur typée `RunState`
 * (qui porte des catalogues vivants non sérialisables).
 */
export async function seedSaveFile(
  page: Page,
  params: { readonly currentRun: Record<string, unknown> | null; readonly meta?: MetaProgression },
): Promise<void> {
  await page.evaluate(
    ({ schemaVersion, currentRun, meta }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("squirrel-heroes");
        request.onerror = () => {
          reject(request.error ?? new Error("indexedDB.open a échoué"));
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("saveSlot", "readwrite");
          tx.objectStore("saveSlot").put({
            id: "current",
            payload: { schemaVersion, currentRun, meta },
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            reject(tx.error ?? new Error("transaction saveSlot a échoué"));
          };
        };
      }),
    {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      currentRun: params.currentRun,
      meta: params.meta ?? INITIAL_META_PROGRESSION,
    },
  );
}

/**
 * Relit le `currentRun` réellement persisté en IndexedDB — utile quand
 * aucun écran n'affiche l'effet vérifié (ex. le feu de camp ne montre pas
 * les PV du héros ni le statut amélioré d'une carte). L'autosave
 * (`persistCurrentSaveFile`) est fire-and-forget par conception ; appeler
 * ceci juste après une action qui doit persister laisse une petite marge
 * avant la lecture pour éviter la même course que documentée dans
 * `tutorial.spec.ts`.
 */
export async function readSavedCurrentRun(page: Page): Promise<Record<string, unknown> | null> {
  await page.waitForTimeout(300);
  return page.evaluate(
    () =>
      new Promise<Record<string, unknown> | null>((resolve, reject) => {
        const request = indexedDB.open("squirrel-heroes");
        request.onerror = () => {
          reject(request.error ?? new Error("indexedDB.open a échoué"));
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("saveSlot", "readonly");
          const getRequest = tx.objectStore("saveSlot").get("current");
          getRequest.onsuccess = () => {
            const record = getRequest.result as { payload?: { currentRun?: Record<string, unknown> | null } } | undefined;
            db.close();
            resolve(record?.payload?.currentRun ?? null);
          };
          getRequest.onerror = () => {
            reject(getRequest.error ?? new Error("lecture saveSlot a échoué"));
          };
        };
      }),
  );
}
