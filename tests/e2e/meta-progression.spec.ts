import { test, expect, type Page } from "@playwright/test";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";

/**
 * Preuve du câblage réel IndexedDB pour `meta` (Phase 5) — le champ n'existe
 * dans aucun e2e antérieur à cette phase. Plutôt que de faire jouer un bot
 * à travers un Acte I entier pour accumuler des Glands d'Or (lent et
 * dépendant du tirage aléatoire des ennemis de floor 0 — même risque de
 * flakiness qu'évité explicitement dans `run-flow.spec.ts`), on amorce
 * directement `meta` dans la vraie base IndexedDB du navigateur : c'est la
 * lecture/l'écriture réelle Dexie qui est sous test ici, pas la logique de
 * `applyRunCompletion`/`purchaseTreeNode` (déjà couverte de façon
 * exhaustive et déterministe par les tests unitaires moteur).
 */
async function seedSaveFile(page: Page, glandsDor: number): Promise<void> {
  await page.evaluate(
    ({ schemaVersion, meta }) =>
      new Promise<void>((resolve, reject) => {
        // Pas de numéro de version explicite : l'app (Dexie) a déjà créé/ouvert la base au
        // chargement précédent de la page, ouvrir sans version évite tout conflit avec la
        // version réelle en place.
        const request = indexedDB.open("squirrel-heroes");
        request.onerror = () => {
          reject(request.error ?? new Error("indexedDB.open a échoué"));
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("saveSlot", "readwrite");
          tx.objectStore("saveSlot").put({
            id: "current",
            payload: { schemaVersion, currentRun: null, meta },
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
    { schemaVersion: CURRENT_SCHEMA_VERSION, meta: { ...INITIAL_META_PROGRESSION, glandsDor } },
  );
}

test("le solde de Glands d'Or persiste réellement en IndexedDB à travers un rechargement", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, 42);
  await page.reload();

  await page.getByRole("button", { name: "Collection" }).click();
  await expect(page.getByTestId("collection-glands-dor")).toContainText("42");

  await page.reload();
  await page.getByRole("button", { name: "Collection" }).click();
  await expect(page.getByTestId("collection-glands-dor")).toContainText("42");
});

test("acheter un nœud de l'arbre depuis la Collection applique son bonus à la run suivante", async ({ page }) => {
  await page.goto("/");
  await seedSaveFile(page, 30); // coût exact de pv_max_1 (+3 PV max)
  await page.reload();

  await page.getByRole("button", { name: "Collection" }).click();
  await page.getByTestId("tree-node-buy-pv_max_1").click();
  await expect(page.getByTestId("collection-glands-dor")).toContainText("0");

  await page.getByRole("button", { name: "Retour" }).click();
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByRole("button", { name: "Commencer" }).click();

  await expect(page.getByTestId("run-hero-hp")).toContainText("83/83");
});
