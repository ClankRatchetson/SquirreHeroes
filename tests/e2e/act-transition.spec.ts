import { test, expect, type Page } from "@playwright/test";
import { CURRENT_SCHEMA_VERSION } from "../../src/persistence";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { RUN_ACTS } from "../../src/content/acts";

/**
 * Preuve e2e directe de la mécanique centrale du lot 4 : vaincre le boss
 * d'un acte NON FINAL (l'Acte I ici) déclenche une récompense de type
 * "boss" puis, une fois résolue, la génération de l'acte suivant plutôt
 * que la fin de la run. Jouer un bot à travers un Acte I entier jusqu'au
 * boss serait lent et dépendant du tirage de la carte (même risque de
 * flakiness qu'évité dans `run-flow.spec.ts`) — on amorce donc directement
 * IndexedDB avec une run déjà en `phase:"recompense"`,
 * `pendingActTransition:true`, boss de l'Acte I déjà comptabilisé dans
 * `bossesDefeatedThisRun`. Même technique d'amorçage direct que
 * `hero-select.spec.ts`/`meta-progression.spec.ts`.
 */
async function seedPendingActTransition(page: Page): Promise<void> {
  const currentRun = {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp: 80,
    deck: [
      { runCardId: "run-card-0", cardId: "noisette_explosive", upgraded: false },
      { runCardId: "run-card-1", cardId: "mur_de_ronces", upgraded: false },
    ],
    noisettes: 20,
    map: {
      actId: "acte_1",
      floorCount: 1,
      nodes: [{ id: "boss0", floor: 0, type: "boss", enemyIds: ["baronne_bec_de_fer"], edges: [] }],
    },
    currentNodeId: "boss0",
    visitedNodeIds: ["boss0"],
    phase: "recompense",
    outcome: "en_cours",
    pendingCombat: null,
    pendingReward: { cardChoices: ["noisette_explosive", "mur_de_ronces"], noisettes: 60 },
    pendingShop: null,
    pendingEventId: null,
    rng: { state: 123456 },
    nextRunCardSeq: 2,
    noisettesBonusPerCombat: 0,
    familiarId: null,
    familiarPassive: null,
    acts: RUN_ACTS,
    actIndex: 0,
    bossesDefeatedThisRun: ["baronne_bec_de_fer"],
    pendingActTransition: true,
  };

  await page.evaluate(
    ({ schemaVersion, currentRun: run, meta }) =>
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
            payload: { schemaVersion, currentRun: run, meta },
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
    { schemaVersion: CURRENT_SCHEMA_VERSION, currentRun, meta: INITIAL_META_PROGRESSION },
  );
}

test("passer la récompense de boss non-final fait basculer la carte vers l'Acte II", async ({ page }) => {
  await page.goto("/");
  await seedPendingActTransition(page);
  await page.reload();

  await page.getByRole("button", { name: "Reprendre la run" }).click();

  // Reprise directement en phase récompense — l'écran de récompense doit s'afficher, pas la carte.
  await expect(page.getByRole("button", { name: "Passer" })).toBeVisible();

  await page.getByRole("button", { name: "Passer" }).click();

  await expect(page.getByTestId("run-act-label")).toHaveText("Acte II — Le Parc");
  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
});

test("choisir une carte de récompense de boss non-final fait aussi basculer vers l'Acte II", async ({ page }) => {
  await page.goto("/");
  await seedPendingActTransition(page);
  await page.reload();

  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByRole("button", { name: "Passer" })).toBeVisible();

  await page.locator('[data-testid="reward-card-choice"]').first().click();

  await expect(page.getByTestId("run-act-label")).toHaveText("Acte II — Le Parc");
  await expect(page.locator('[data-testid="run-node"]').first()).toBeVisible();
});
