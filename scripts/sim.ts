import * as fs from "node:fs";
import * as path from "node:path";
import { CARD_CATALOG } from "../src/content/cards";
import { CASSE_NOIX } from "../src/content/heroes";
import { ENEMY_CATALOG } from "../src/content/enemies";
import { EVENT_CATALOG } from "../src/content/events";
import { META_TREE } from "../src/content/meta-tree";
import { INITIAL_META_PROGRESSION } from "../src/engine/meta";
import { runSimulation } from "../src/sim/report";
import type { BalanceReport } from "../src/sim/types";

/**
 * Harnais de simulation & équilibrage (Phase 6) — livrable littéral du
 * planning : `npm run sim -- --runs=10000` produit un rapport d'équilibrage
 * exploitable. CLI fine : parse les arguments, délègue l'orchestration à
 * `runSimulation` (`src/sim/report.ts`), imprime un résumé, écrit le
 * rapport JSON complet.
 */

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

function printSummary(report: BalanceReport): void {
  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
  console.log("");
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

const { runs, seed } = parseArgs(process.argv.slice(2));

const report = runSimulation({
  hero: CASSE_NOIX,
  cardCatalog: CARD_CATALOG,
  enemyCatalog: ENEMY_CATALOG,
  eventCatalog: EVENT_CATALOG,
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
  cardIds: Object.keys(CARD_CATALOG),
  metaTree: META_TREE,
  initialMetaProgression: INITIAL_META_PROGRESSION,
  runs,
  seed,
});

console.log(`Simulation Phase 6 — ${String(report.config.runs)} runs (${String(report.config.runs / 2)} par lot), seed ${String(seed)}`);
printSummary(report);

const outDir = path.resolve(process.cwd(), "sim-reports");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(
  outDir,
  `${new Date().toISOString().replace(/[:.]/g, "-")}-seed${String(seed)}-runs${String(report.config.runs)}.json`,
);
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
console.log(`\nRapport écrit dans ${outFile}`);

process.exit(0);
