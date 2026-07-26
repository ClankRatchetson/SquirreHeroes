import { z } from "zod";
import type { EffectSpec } from "../../engine/types";
import { statusIdSchema } from "./status.schema";

const singleTargetSchema = z.enum(["self", "enemy"]);
const effectTargetSchema = z.enum(["self", "enemy", "all_enemies"]);

const damageSchema = z.strictObject({
  kind: z.literal("damage"),
  target: singleTargetSchema,
  amount: z.number().int().positive(),
});

const damageAllSchema = z.strictObject({
  kind: z.literal("damageAll"),
  amount: z.number().int().positive(),
});

const multiHitSchema = z.strictObject({
  kind: z.literal("multiHit"),
  target: singleTargetSchema,
  hits: z.number().int().positive(),
  amountPerHit: z.number().int().positive(),
});

const blockSchema = z.strictObject({
  kind: z.literal("block"),
  target: singleTargetSchema,
  amount: z.number().int().positive(),
});

const healSchema = z.strictObject({
  kind: z.literal("heal"),
  target: singleTargetSchema,
  amount: z.number().int().positive(),
});

const drawSchema = z.strictObject({
  kind: z.literal("draw"),
  amount: z.number().int().positive(),
});

const gainEnergySchema = z.strictObject({
  kind: z.literal("gainEnergy"),
  amount: z.number().int().positive(),
});

const discardSchema = z.strictObject({
  kind: z.literal("discard"),
  amount: z.number().int().positive(),
});

const exhaustSchema = z.strictObject({
  kind: z.literal("exhaust"),
});

const applyStatusSchema = z.strictObject({
  kind: z.literal("applyStatus"),
  target: effectTargetSchema,
  status: statusIdSchema,
  stacks: z.number().int().positive(),
});

const removeStatusSchema = z.strictObject({
  kind: z.literal("removeStatus"),
  target: effectTargetSchema,
  status: statusIdSchema,
});

const doubleStatusSchema = z.strictObject({
  kind: z.literal("doubleStatus"),
  target: effectTargetSchema,
  status: statusIdSchema,
});

const conditionalSchema = z.strictObject({
  kind: z.literal("conditional"),
  target: effectTargetSchema,
  status: statusIdSchema,
  whenTrue: z.lazy(() => z.array(effectSpecSchema)),
  whenFalse: z.lazy(() => z.array(effectSpecSchema)),
});

/**
 * Vocabulaire d'effets fermé — 13 primitives implémentées en Phase 1,
 * miroir exact de `/src/engine/types/effect.ts`. `z.ZodType<EffectSpec>`
 * force la conformité structurelle : toute dérive entre ce schéma et le
 * type moteur casse la compilation, pas seulement le runtime.
 */
export const effectSpecSchema: z.ZodType<EffectSpec> = z.discriminatedUnion("kind", [
  damageSchema,
  damageAllSchema,
  multiHitSchema,
  blockSchema,
  healSchema,
  drawSchema,
  gainEnergySchema,
  discardSchema,
  exhaustSchema,
  applyStatusSchema,
  removeStatusSchema,
  doubleStatusSchema,
  conditionalSchema,
]);
