import { INITIAL_META_PROGRESSION } from "../engine/meta";
import { CURRENT_SCHEMA_VERSION } from "./save-file";

export interface Migration {
  readonly fromVersion: number;
  readonly migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * v2 (Phase 5) → v3 (Phase 7 lot 3) : `currentRun` gagne `familiarId: null`
 * (aucune run antérieure au familier n'en a un) et, si un combat est en
 * cours, `pendingCombat.familiarPassive: null` de la même façon.
 */
function migrateRunToV3(currentRun: Record<string, unknown>): Record<string, unknown> {
  const pendingCombat = currentRun.pendingCombat;
  return {
    ...currentRun,
    familiarId: null,
    pendingCombat:
      pendingCombat === null || pendingCombat === undefined
        ? null
        : { ...(pendingCombat as Record<string, unknown>), familiarPassive: null },
  };
}

/**
 * v3 (Phase 7 lot 3) → v4 (Phase 7 lot 4) : `currentRun` gagne `acts`
 * (backfillé avec la config RÉELLE et unique de l'Acte I — la seule qui ait
 * jamais existé avant ce lot, aucune sauvegarde ne peut donc en avoir une
 * autre), `actIndex: 0`, `bossesDefeatedThisRun: []` et
 * `pendingActTransition: false` (une run persistée est TOUJOURS
 * `outcome:"en_cours"` — seules les runs en cours sont sauvegardées — donc
 * aucun boss n'a pu être vaincu dans cette comptabilité avant que ce lot
 * n'existe). Littéraux dupliqués depuis `src/content/acts.ts` plutôt
 * qu'importés : `/src/persistence` ne dépend jamais de `/src/content`.
 */
const ACT_I_CONFIG_V4_BACKFILL = {
  actId: "acte_1",
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
};

function migrateRunToV4(currentRun: Record<string, unknown>): Record<string, unknown> {
  return {
    ...currentRun,
    acts: [ACT_I_CONFIG_V4_BACKFILL],
    actIndex: 0,
    bossesDefeatedThisRun: [],
    pendingActTransition: false,
  };
}

/**
 * v4 (Phase 7 lot 4) → v5 (Phase 8 lot 1 — tutoriel) : `meta` gagne
 * `tutorialCompleted`. Backfillé à `true` pour toute sauvegarde
 * PRÉEXISTANTE : quiconque a déjà une sauvegarde a nécessairement déjà
 * démarré au moins une run, donc n'a pas besoin qu'on lui rejoue le
 * tutoriel de premier combat — seul un tout nouveau joueur
 * (`INITIAL_META_PROGRESSION`, `tutorialCompleted: false`) le verra.
 */
function migrateMetaToV5(meta: Record<string, unknown>): Record<string, unknown> {
  return { ...meta, tutorialCompleted: true };
}

/**
 * Historique des migrations : v1 (Phase 4, pas de `meta`, pas de
 * `noisettesBonusPerCombat` sur `currentRun`) → v2 (Phase 5, ajoute `meta` +
 * `noisettesBonusPerCombat: 0`) → v3 (Phase 7 lot 3, ajoute
 * `familiarId`/`familiarPassive: null`, cf. `migrateRunToV3`) → v4 (Phase 7
 * lot 4, ajoute `acts`/`actIndex`/`bossesDefeatedThisRun`/
 * `pendingActTransition`, cf. `migrateRunToV4`) → v5 (Phase 8 lot 1, ajoute
 * `meta.tutorialCompleted`, cf. `migrateMetaToV5`).
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    fromVersion: 1,
    migrate: (data) => ({
      schemaVersion: 2,
      currentRun:
        data.currentRun === null
          ? null
          : { ...(data.currentRun as Record<string, unknown>), noisettesBonusPerCombat: 0 },
      meta: INITIAL_META_PROGRESSION,
    }),
  },
  {
    fromVersion: 2,
    migrate: (data) => ({
      schemaVersion: 3,
      currentRun: data.currentRun === null ? null : migrateRunToV3(data.currentRun as Record<string, unknown>),
      meta: data.meta,
    }),
  },
  {
    fromVersion: 3,
    migrate: (data) => ({
      schemaVersion: 4,
      currentRun: data.currentRun === null ? null : migrateRunToV4(data.currentRun as Record<string, unknown>),
      meta: data.meta,
    }),
  },
  {
    fromVersion: 4,
    migrate: (data) => ({
      schemaVersion: 5,
      currentRun: data.currentRun,
      meta: migrateMetaToV5(data.meta as Record<string, unknown>),
    }),
  },
];

export interface MigratableEnvelope {
  readonly schemaVersion: number;
  readonly currentRun: unknown;
  readonly meta?: unknown;
}

/**
 * Applique séquentiellement `MIGRATIONS` jusqu'à `CURRENT_SCHEMA_VERSION` ;
 * lève si aucun chemin n'existe depuis une version antérieure, ou si la
 * sauvegarde annonce une version PLUS RÉCENTE que celle connue par ce
 * build (donnée écrite par une version future de l'app — sa forme nous est
 * inconnue, mieux vaut échouer explicitement que la faire silencieusement
 * transiter telle quelle).
 */
export function runMigrations(envelope: MigratableEnvelope): MigratableEnvelope {
  if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Sauvegarde d'une version future non prise en charge : schemaVersion=${String(envelope.schemaVersion)}.`);
  }
  let current = envelope;
  while (current.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migration = MIGRATIONS.find((m) => m.fromVersion === current.schemaVersion);
    if (!migration) {
      throw new Error(`Aucune migration depuis schemaVersion=${String(current.schemaVersion)}.`);
    }
    const migrated = migration.migrate({
      schemaVersion: current.schemaVersion,
      currentRun: current.currentRun,
      meta: current.meta,
    });
    current = {
      schemaVersion: migrated.schemaVersion as number,
      currentRun: migrated.currentRun,
      meta: migrated.meta,
    };
  }
  return current;
}
