import * as fs from "node:fs";
import * as path from "node:path";
import { CARD_CATALOG } from "../src/content/cards";
import { HERO_CATALOG } from "../src/content/heroes";
import { ENEMY_CATALOG } from "../src/content/enemies";
import { EVENT_CATALOG } from "../src/content/events";
import { META_TREE } from "../src/content/meta-tree";
import { INITIAL_META_PROGRESSION } from "../src/engine/meta";
import { runSimulation } from "../src/sim/report";
import type { BalanceReport } from "../src/sim/types";
import type { HeroDefinition } from "../src/engine/types";

/**
 * Harnais de simulation & équilibrage (Phase 6, étendu Phase 7 lot 1) —
 * livrable littéral du planning : `npm run sim -- --runs=10000` produit un
 * rapport d'équilibrage exploitable. Un héros simule toujours une run à la
 * fois (`createRun`/`createCombat` sont mono-héros par construction) — ce
 * script boucle donc sur `HERO_CATALOG` et imprime/écrit un rapport par
 * héros, plutôt que d'élargir `runSimulation` à plusieurs héros en un seul
 * batch (reporté à un lot ultérieur si le besoin s'en fait sentir).
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

function printSummary(heroId: string, report: BalanceReport): void {
  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
  console.log(`\n=== ${heroId} ===`);
  console.log(`Lot "sans bonus" — taux de victoire global : ${pct(report.baseline.winRate)}`);
  for (const hero of report.baseline.byHero) {
    console.log(`  ${hero.heroId} : ${String(hero.victories)}/${String(hero.runsPlayed)} (${pct(hero.winRate)})`);
  }
  console.log(`Lot "arbre complet" — taux de victoire global : ${pct(report.fullyUpgraded.winRate)}`);
  console.log("");
  console.log(`Cartes sous-choisies : ${report.baseline.flags.underPicked.join(", ") || "(aucune)"}`);
  console.log(`Cartes sur-choisies : ${report.baseline.flags.overPicked.join(", ") || "(aucune)"}`);
  console.log(`Cartes dominantes : ${report.baseline.flags.dominant.join(", ") || "(aucune)"}`);
  console.log("");
  const cap = report.glandsDorCapCheck;
  console.log(
    `Plafond Canal B : bonus PV max = ${cap.hpBonusPercent.toFixed(1)}% (plafond 20%) -> ${cap.withinCap ? "OK" : "DÉPASSÉ"}`,
  );
  console.log(`  Écart de taux de victoire sans-bonus -> arbre complet : ${cap.winRateDeltaPoints.toFixed(1)} points`);
}

/** Cartes réellement éligibles à ce héros (les siennes + le pool neutre) — même filtre que `rewards.ts`/`shop.ts`. */
function eligibleCardIdsFor(hero: HeroDefinition): readonly string[] {
  return Object.values(CARD_CATALOG)
    .filter((card) => card.hero === hero.id || card.hero === "neutre")
    .map((card) => card.id);
}

function simulateHero(hero: HeroDefinition, runs: number, seed: number): BalanceReport {
  return runSimulation({
    hero,
    cardCatalog: CARD_CATALOG,
    enemyCatalog: ENEMY_CATALOG,
    eventCatalog: EVENT_CATALOG,
    commonEnemyIds: COMMON_ENEMY_IDS,
    eliteEnemyIds: ELITE_ENEMY_IDS,
    bossEnemyIds: BOSS_ENEMY_IDS,
    cardIds: eligibleCardIdsFor(hero),
    metaTree: META_TREE,
    initialMetaProgression: INITIAL_META_PROGRESSION,
    runs,
    seed,
  });
}

const { runs, seed } = parseArgs(process.argv.slice(2));
const heroes = Object.values(HERO_CATALOG);

console.log(`Simulation — ${String(heroes.length)} héros × ${String(runs)} runs, seed ${String(seed)}`);

const outDir = path.resolve(process.cwd(), "sim-reports");
fs.mkdirSync(outDir, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

for (const hero of heroes) {
  const report = simulateHero(hero, runs, seed);
  printSummary(hero.id, report);

  const outFile = path.join(outDir, `${timestamp}-${hero.id}-seed${String(seed)}-runs${String(report.config.runs)}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`Rapport écrit dans ${outFile}`);
}

process.exit(0);
