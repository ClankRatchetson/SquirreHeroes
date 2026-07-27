import { test, expect, type Page } from "@playwright/test";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";

/**
 * Preuve du lot 1 de la Phase 7 : Captain Cabriole verrouillé avant l'Acte I,
 * sélectionnable après, et une run démarrée avec lui reflète bien SES PV
 * (pas ceux de Casse-Noix). Même technique d'amorçage direct d'IndexedDB que
 * `meta-progression.spec.ts` — éviter de faire jouer un bot à travers un
 * Acte I entier juste pour débloquer un héros, cf. le commentaire de ce
 * fichier pour le raisonnement complet.
 */
async function seedActICompleted(page: Page): Promise<void> {
  await page.evaluate(
    ({ schemaVersion, meta }) =>
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
    { schemaVersion: CURRENT_SCHEMA_VERSION, meta: { ...INITIAL_META_PROGRESSION, actICompleted: true } },
  );
}

test("Captain Cabriole est verrouillé avant l'Acte I, sélectionnable après", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByTestId("hero-select-card-captain_cabriole")).toBeDisabled();

  await page.getByRole("button", { name: "Retour" }).click();
  await seedActICompleted(page);
  await page.reload();

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByTestId("hero-select-card-captain_cabriole")).toBeEnabled();
});

test("démarrer une run avec Captain Cabriole reflète ses PV max, pas ceux de Casse-Noix", async ({ page }) => {
  await page.goto("/");
  await seedActICompleted(page);
  await page.reload();

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByTestId("hero-select-card-captain_cabriole").click();
  await page.getByRole("button", { name: "Commencer" }).click();

  await expect(page.getByTestId("run-hero-hp")).toContainText("76/76");
});

test("Docteur Bogue est verrouillé avant l'Acte I, sélectionnable après", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByTestId("hero-select-card-docteur_bogue")).toBeDisabled();

  await page.getByRole("button", { name: "Retour" }).click();
  await seedActICompleted(page);
  await page.reload();

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByTestId("hero-select-card-docteur_bogue")).toBeEnabled();
});

test("démarrer une run avec Docteur Bogue reflète ses PV max, pas ceux de Casse-Noix", async ({ page }) => {
  await page.goto("/");
  await seedActICompleted(page);
  await page.reload();

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await page.getByTestId("hero-select-card-docteur_bogue").click();
  await page.getByRole("button", { name: "Commencer" }).click();

  await expect(page.getByTestId("run-hero-hp")).toContainText("78/78");
});
