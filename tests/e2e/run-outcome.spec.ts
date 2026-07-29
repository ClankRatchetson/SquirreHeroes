import { test, expect } from "@playwright/test";
import { RUN_ACTS } from "../../src/content/acts";
import { INITIAL_META_PROGRESSION } from "../../src/engine/meta";
import { seedSaveFile } from "./helpers/seed-save";

/** Tutoriel de premier combat (Phase 8 lot 1) déjà vu — hors sujet ici, ne doit pas intercepter les clics. */
const META_TUTORIAL_DONE = { ...INITIAL_META_PROGRESSION, tutorialCompleted: true };

/**
 * Preuve e2e directe des deux issues de fin de run — jamais couvertes
 * jusqu'ici (`suite e2e complète`, Phase 8) : `run-flow.spec.ts` laisse un
 * bot jouer jusqu'à CE QUE le combat se termine d'une façon ou d'une
 * autre, sans jamais affirmer laquelle.
 *
 * `outcome:"run_over"` n'est jamais directement résumable (`canResume`
 * exige `outcome:"en_cours"`, cf. `App.tsx`) : une run terminée n'a rien à
 * reprendre. On amorce donc `phase:"combat"` sur le boss du DERNIER acte,
 * à un coup de la fin (ennemi à 1 PV pour la victoire, héros à PV très
 * bas contre une intention ennemie mortelle pour la défaite), et on
 * laisse la transition combat -> `run_over` se produire EN DIRECT via de
 * vraies actions UI, pas via un rechargement. Le `CombatState` seedé est
 * un vrai état produit par `createCombat` (dump ponctuel, cf. historique
 * de session) — écarter tout risque de forme invalide à la main.
 */
const BASE_HERO = { maxHp: 80, block: 0, statuses: [], retainsBlock: false };

const WOLF_MOVES = {
  morsure_alpha: {
    id: "morsure_alpha",
    nameKey: "enemies.grand_loup_hurleur.moves.morsure_alpha.name",
    effects: [{ kind: "damage", target: "enemy", amount: 17 }],
  },
  tempete_de_crocs: {
    id: "tempete_de_crocs",
    nameKey: "enemies.grand_loup_hurleur.moves.tempete_de_crocs.name",
    effects: [{ kind: "multiHit", target: "enemy", hits: 4, amountPerHit: 5 }],
  },
  hurlement_terrifiant: {
    id: "hurlement_terrifiant",
    nameKey: "enemies.grand_loup_hurleur.moves.hurlement_terrifiant.name",
    effects: [
      { kind: "applyStatus", target: "enemy", status: "etourdi", stacks: 1 },
      { kind: "block", target: "self", amount: 12 },
    ],
  },
  chatiment_de_la_meute: {
    id: "chatiment_de_la_meute",
    nameKey: "enemies.grand_loup_hurleur.moves.chatiment_de_la_meute.name",
    effects: [
      {
        kind: "conditional",
        target: "enemy",
        status: "etourdi",
        whenTrue: [{ kind: "damage", target: "enemy", amount: 27 }],
        whenFalse: [
          { kind: "damage", target: "enemy", amount: 17 },
          { kind: "applyStatus", target: "enemy", status: "etourdi", stacks: 1 },
        ],
      },
    ],
  },
};

const WOLF_PATTERN = ["morsure_alpha", "tempete_de_crocs", "hurlement_terrifiant", "chatiment_de_la_meute"];

function wolfInstance(hp: number): Record<string, unknown> {
  return {
    instanceId: "grand_loup_hurleur-0",
    defId: "grand_loup_hurleur",
    nameKey: "enemies.grand_loup_hurleur.name",
    maxHp: 128,
    hp,
    block: 0,
    statuses: [],
    movesTaken: 0,
    intent: WOLF_MOVES.morsure_alpha,
    pattern: WOLF_PATTERN,
    moves: WOLF_MOVES,
  };
}

function bossRunAtActIII(pendingCombat: Record<string, unknown>, heroHp: number): Record<string, unknown> {
  return {
    heroId: "casse_noix",
    heroMaxHp: 80,
    heroHp,
    deck: [{ runCardId: "run-card-0", cardId: "noisette_explosive", upgraded: false }],
    noisettes: 20,
    map: {
      actId: "acte_3",
      floorCount: 1,
      nodes: [{ id: "boss0", floor: 0, type: "boss", enemyIds: ["grand_loup_hurleur"], edges: [] }],
    },
    currentNodeId: "boss0",
    visitedNodeIds: ["boss0"],
    phase: "combat",
    outcome: "en_cours",
    pendingCombat,
    pendingReward: null,
    pendingShop: null,
    pendingEventId: null,
    rng: { state: 1 },
    nextRunCardSeq: 1,
    noisettesBonusPerCombat: 0,
    familiarId: null,
    familiarPassive: null,
    acts: RUN_ACTS,
    actIndex: 2,
    bossesDefeatedThisRun: [],
    pendingActTransition: false,
  };
}

test("vaincre le boss du dernier acte affiche l'écran de victoire de la run entière", async ({ page }) => {
  const pendingCombat = {
    hero: { ...BASE_HERO, hp: 80 },
    enemies: [wolfInstance(1)],
    drawPile: [],
    hand: [{ instanceId: "ci-0", cardId: "noisette_explosive", upgraded: false }],
    discardPile: [],
    exhaustPile: [],
    energy: 3,
    maxEnergy: 3,
    turnNumber: 1,
    phase: "hero_turn",
    outcome: "en_cours",
    rng: { state: 1 },
    nextInstanceSeq: 1,
    familiarPassive: null,
  };

  await page.goto("/");
  await seedSaveFile(page, { currentRun: bossRunAtActIII(pendingCombat, 80), meta: META_TUTORIAL_DONE });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();

  // Noisette Explosive : 8 dégâts garantis, largement assez contre un loup à 1 PV.
  await page.locator('[data-testid="card-in-hand"]').first().click();
  await page.getByTestId("enemy-target").first().click();

  await expect(page.getByTestId("run-outcome")).toBeVisible();
  await expect(page.getByTestId("run-outcome")).toContainText("Victoire ! La Forêt est sauvée.");

  await page.getByRole("button", { name: "Nouvelle run" }).click();
  await expect(page.getByRole("heading", { name: "Choisis ton héros" })).toBeVisible();
});

test("la défaite affiche un écran de fin de run distinct de la victoire", async ({ page }) => {
  const pendingCombat = {
    hero: { ...BASE_HERO, hp: 10 },
    enemies: [wolfInstance(128)],
    drawPile: [],
    hand: [{ instanceId: "ci-0", cardId: "noisette_explosive", upgraded: false }],
    discardPile: [],
    exhaustPile: [],
    energy: 3,
    maxEnergy: 3,
    turnNumber: 1,
    phase: "hero_turn",
    outcome: "en_cours",
    rng: { state: 1 },
    nextInstanceSeq: 1,
    familiarPassive: null,
  };

  await page.goto("/");
  await seedSaveFile(page, { currentRun: bossRunAtActIII(pendingCombat, 10), meta: META_TUTORIAL_DONE });
  await page.reload();
  await page.getByRole("button", { name: "Reprendre la run" }).click();
  await expect(page.getByTestId("hero-panel")).toBeVisible();

  // Ne rien jouer : "Morsure alpha" (17 dégâts) tue un héros à 10 PV sans blocage.
  await page.getByTestId("end-turn-button").click();

  await expect(page.getByTestId("run-outcome")).toBeVisible();
  await expect(page.getByTestId("run-outcome")).toContainText("Défaite — la run s'arrête ici");
  await expect(page.getByTestId("run-outcome")).not.toContainText("Victoire");
});
