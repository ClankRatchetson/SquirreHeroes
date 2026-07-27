import { aggregateTreeBonuses } from "../engine/meta";
import type { MetaProgression, MetaTreeNode } from "../engine/meta";
import type { CardId, HeroDefinition } from "../engine/types";
import type { CreateRunParams } from "../engine/run/create-run";
import { simulateOneRun } from "./run-one";
import { aggregateBatch, buildGlandsDorCapCheck } from "./aggregate";
import type { BalanceReport, SimRunRecord } from "./types";

export interface RunSimulationConfig {
  readonly hero: HeroDefinition;
  readonly cardCatalog: CreateRunParams["cardCatalog"];
  readonly enemyCatalog: CreateRunParams["enemyCatalog"];
  readonly eventCatalog: CreateRunParams["eventCatalog"];
  readonly commonEnemyIds: CreateRunParams["commonEnemyIds"];
  readonly eliteEnemyIds: CreateRunParams["eliteEnemyIds"];
  readonly bossEnemyIds: CreateRunParams["bossEnemyIds"];
  readonly cardIds: readonly CardId[];
  readonly metaTree: readonly MetaTreeNode[];
  readonly initialMetaProgression: MetaProgression;
  readonly runs: number;
  readonly seed: number;
}

type BatchBonuses = Partial<Pick<CreateRunParams, "bonusMaxHp" | "upgradedStartingCardIds" | "noisettesBonusPerCombat">>;

function runBatch(config: RunSimulationConfig, perBatch: number, bonuses: BatchBonuses): readonly SimRunRecord[] {
  const records: SimRunRecord[] = [];
  for (let i = 0; i < perBatch; i += 1) {
    records.push(
      simulateOneRun({
        hero: config.hero,
        cardCatalog: config.cardCatalog,
        enemyCatalog: config.enemyCatalog,
        eventCatalog: config.eventCatalog,
        commonEnemyIds: config.commonEnemyIds,
        eliteEnemyIds: config.eliteEnemyIds,
        bossEnemyIds: config.bossEnemyIds,
        // Seeds appariées avec l'autre lot (même index -> même seed) : même carte, mêmes
        // ennemis, mêmes événements générés dans les 2 lots — seule la puissance de départ
        // du héros diffère, ce qui isole l'effet du Canal B du bruit de génération.
        runSeed: config.seed + i,
        policySeed: config.seed + 1_000_000 + i,
        ...bonuses,
      }),
    );
  }
  return records;
}

/**
 * Orchestre les 2 lots (sans bonus / arbre de Glands d'Or complet) et
 * produit le `BalanceReport` complet — extrait de `scripts/sim.ts` pour
 * rester testable directement (petit N) sans passer par `tsx`/`child_process`
 * ni déclencher les effets de bord du CLI (écriture fichier, `process.exit`).
 */
export function runSimulation(config: RunSimulationConfig): BalanceReport {
  const perBatch = Math.max(1, Math.floor(config.runs / 2));

  const fullyUnlockedMeta: MetaProgression = {
    ...config.initialMetaProgression,
    unlockedTreeNodeIds: config.metaTree.map((n) => n.id),
  };
  const fullBonuses = aggregateTreeBonuses(fullyUnlockedMeta, config.metaTree);

  const baselineRecords = runBatch(config, perBatch, {});
  const fullyUpgradedRecords = runBatch(config, perBatch, {
    bonusMaxHp: fullBonuses.bonusMaxHp,
    upgradedStartingCardIds: fullBonuses.upgradedStartingCardIds,
    noisettesBonusPerCombat: fullBonuses.noisettesBonusPerCombat,
  });

  const baseline = aggregateBatch(baselineRecords, config.cardIds);
  const fullyUpgraded = aggregateBatch(fullyUpgradedRecords, config.cardIds);

  const glandsDorCapCheck = buildGlandsDorCapCheck({
    heroMaxHp: config.hero.maxHp,
    totalBonusMaxHp: fullBonuses.bonusMaxHp,
    baselineWinRate: baseline.winRate,
    fullyUpgradedWinRate: fullyUpgraded.winRate,
  });

  return {
    config: { runs: perBatch * 2, seed: config.seed },
    baseline,
    fullyUpgraded,
    glandsDorCapCheck,
  };
}
