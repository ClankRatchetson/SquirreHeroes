import { z } from "zod";
import type { MetaProgression } from "../engine/meta";
import type { PersistedRunState } from "./save-file";

/**
 * `meta` élargi explicitement : `z.object` (non-strict) de Zod supprime par
 * défaut toute clé non déclarée — sans cette entrée, `meta` serait
 * silencieusement effacé avant même que `runMigrations` ne le voie
 * (vérifié empiriquement).
 */
const saveEnvelopeSchema = z.object({
  schemaVersion: z.number().int().positive(),
  currentRun: z.unknown().nullable(),
  meta: z.unknown().optional(),
});

/**
 * Validation volontairement peu profonde (enveloppe + forme de premier
 * niveau), pas un miroir complet de `RunState` façon
 * `content/schemas/card.schema.ts`. Différence de nature assumée : les
 * schémas de contenu valident du JSON écrit à la main par un humain (plein
 * de façons de se tromper), alors qu'un `PersistedRunState` n'est jamais
 * écrit à la main — il ne provient que de `stripRunState(RunState)`,
 * lui-même produit par un réducteur déjà testé. Le vrai risque de
 * corruption IndexedDB c'est « rien en base », « données étrangères », ou
 * un `schemaVersion` différent (couvert par les migrations) — pas « un
 * `RunState` syntaxiquement plausible mais faux champ par champ ». Un
 * schéma profond forcerait à dupliquer toute évolution future des types
 * moteur ici, pour un scénario qui ne se produit pas.
 */
const persistedRunShapeSchema = z.object({
  heroId: z.string(),
  heroMaxHp: z.number(),
  heroHp: z.number(),
  deck: z.array(z.unknown()),
  noisettes: z.number(),
  map: z.object({ actId: z.string(), floorCount: z.number(), nodes: z.array(z.unknown()) }),
  currentNodeId: z.string().nullable(),
  visitedNodeIds: z.array(z.unknown()),
  phase: z.string(),
  outcome: z.string(),
  pendingCombat: z.unknown().nullable(),
  pendingReward: z.unknown().nullable(),
  pendingShop: z.unknown().nullable(),
  pendingEventId: z.string().nullable(),
  rng: z.object({ state: z.number() }),
  nextRunCardSeq: z.number(),
});

export function parseEnvelope(
  raw: unknown,
): z.ZodSafeParseResult<{ schemaVersion: number; currentRun: unknown; meta?: unknown }> {
  return saveEnvelopeSchema.safeParse(raw);
}

export function looksLikePersistedRunState(raw: unknown): raw is PersistedRunState {
  return persistedRunShapeSchema.safeParse(raw).success;
}

const metaProgressionShapeSchema = z.object({
  totalRunsStarted: z.number(),
  totalVictories: z.number(),
  totalDefeats: z.number(),
  actICompleted: z.boolean(),
  bossesDefeated: z.array(z.unknown()),
  glandsDor: z.number(),
  unlockedTreeNodeIds: z.array(z.unknown()),
});

export function looksLikeMetaProgression(raw: unknown): raw is MetaProgression {
  return metaProgressionShapeSchema.safeParse(raw).success;
}
