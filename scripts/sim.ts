import * as fs from "node:fs";
import * as path from "node:path";
import { CARD_CATALOG } from "../src/content/cards";
import { HERO_CATALOG } from "../src/content/heroes";
import { FAMILIAR_CATALOG } from "../src/content/familiars";
import { ENEMY_CATALOG } from "../src/content/enemies";
import { EVENT_CATALOG } from "../src/content/events";
import { META_TREE } from "../src/content/meta-tree";
import { INITIAL_META_PROGRESSION } from "../src/engine/meta";
import { runSimulation } from "../src/sim/report";
import type { BalanceReport } from "../src/sim/types";
import type { FamiliarDefinition, HeroDefinition } from "../src/engine/types";

/**
 * Harnais de simulation & équilibrage (Phase 6, étendu Phase 7 lots 1-3) —
 * livrable littéral du planning : `npm run sim -- --runs=10000` produit un
 * rapport d'équilibrage exploitable. Une run simule toujours un couple
 * héros×familier à la fois (`createRun`/`createCombat` sont mono-héros et
 * mono-familier par construction) — ce script boucle donc sur les 12
 * combinaisons (`HERO_CATALOG` × `FAMILIAR_CATALOG`) et imprime un tableau
 * récapitulatif condensé (pas un bloc verbeux par combinaison, ce serait
 * illisible à 12 lignes) tout en écrivant un rapport JSON complet par
 * combinaison pour analyse approfondie.
 */

const COMMON_ENEMY_IDS = ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"];
const ELITE_ENEMY_IDS = ["merle_mercenaire"];
const BOSS_ENEMY_IDS = ["baronne_bec_de_fer"];

function parseArgs(argv: readonly string[]): { readonly runs: number; readonly seed: number } {
  let runs = 1000;
  let seed = 42;
  for (const arg of argv) {
    const runsMatch = /^--runs=(\d+)$/.exec(arg);
    if (runsMatch?.[1]) {
      runs = Number.parseInt(runsMatch[1], 10);
    }
    const seedMatch = /^--seed=(\d+)$/.exec(arg);
    if (seedMatch?.[1]) {
      seed = Number.parseInt(seedMatch[1], 10);
    }
  }
  return { runs, seed };
}

/** Cartes réellement éligibles à ce couple (les siennes + le pool neutre + la signature du familier), même filtre que `rewards.ts`/`shop.ts`. */
function eligibleCardIdsFor(hero: HeroDefinition, familiar: FamiliarDefinition): readonly string[] {
  return Object.values(CARD_CATALOG)
    .filter((card) => card.hero === hero.id || card.hero === "neutre" || card.hero === familiar.id)
    .map((card) => card.id);
}

function simulateCombo(hero: HeroDefinition, familiar: FamiliarDefinition, runs: number, seed: number): BalanceReport {
  return runSimulation({
    hero,
    familiar,
    cardCatalog: CARD_CATALOG,
    enemyCatalog: ENEMY_CATALOG,
    eventCatalog: EVENT_CATALOG,
    commonEnemyIds: COMMON_ENEMY_IDS,
    eliteEnemyIds: ELITE_ENEMY_IDS,
    bossEnemyIds: BOSS_ENEMY_IDS,
    cardIds: eligibleCardIdsFor(hero, familiar),
    metaTree: META_TREE,
    initialMetaProgression: INITIAL_META_PROGRESSION,
    runs,
    seed,
  });
}

const { runs, seed } = parseArgs(process.argv.slice(2));
const heroes = Object.values(HERO_CATALOG);
const familiars = Object.values(FAMILIAR_CATALOG);

console.log(
  `Simulation — ${String(heroes.length)} héros × ${String(familiars.length)} familiers × ${String(runs)} runs, seed ${String(seed)}`,
);

const outDir = path.resolve(process.cwd(), "sim-reports");
fs.mkdirSync(outDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;

interface ComboRow {
  readonly heroId: string;
  readonly familiarId: string;
  readonly baselineWinRate: number;
  readonly fullyUpgradedWinRate: number;
  readonly withinCap: boolean;
}

const rows: ComboRow[] = [];
const allUnderPicked = new Set<string>();
const allOverPicked = new Set<string>();
const allDominant = new Set<string>();
let anyCapExceeded = false;

for (const hero of heroes) {
  for (const familiar of familiars) {
    const report = simulateCombo(hero, familiar, runs, seed);
    rows.push({
      heroId: hero.id,
      familiarId: familiar.id,
      baselineWinRate: report.baseline.winRate,
      fullyUpgradedWinRate: report.fullyUpgraded.winRate,
      withinCap: report.glandsDorCapCheck.withinCap,
    });
    for (const c of report.baseline.flags.underPicked) allUnderPicked.add(c);
    for (const c of report.baseline.flags.overPicked) allOverPicked.add(c);
    for (const c of report.baseline.flags.dominant) allDominant.add(c);
    if (!report.glandsDorCapCheck.withinCap) {
      anyCapExceeded = true;
    }

    const outFile = path.join(
      outDir,
      `${timestamp}-${hero.id}-${familiar.id}-seed${String(seed)}-runs${String(report.config.runs)}.json`,
    );
    fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  }
}

console.log("\nhéros              | familier          | sans bonus | arbre complet | plafond +20%");
console.log("--------------------|-------------------|------------|----------------|-------------");
for (const row of rows) {
  console.log(
    `${row.heroId.padEnd(19)} | ${row.familiarId.padEnd(17)} | ${pct(row.baselineWinRate).padStart(10)} | ${pct(
      row.fullyUpgradedWinRate,
    ).padStart(14)} | ${row.withinCap ? "OK" : "DÉPASSÉ"}`,
  );
}

console.log("");
console.log(`Cartes sous-choisies (au moins une combinaison) : ${[...allUnderPicked].join(", ") || "(aucune)"}`);
console.log(`Cartes sur-choisies (au moins une combinaison) : ${[...allOverPicked].join(", ") || "(aucune)"}`);
console.log(`Cartes dominantes (au moins une combinaison) : ${[...allDominant].join(", ") || "(aucune)"}`);
console.log(`Plafond Canal B respecté sur toutes les combinaisons : ${anyCapExceeded ? "NON — voir ci-dessus" : "OUI"}`);
console.log(`\n${String(rows.length)} rapports JSON complets écrits dans ${outDir}`);

process.exit(0);
