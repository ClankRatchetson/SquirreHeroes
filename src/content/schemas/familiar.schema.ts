import { z } from "zod";
import type { FamiliarDefinition, FamiliarPassive } from "../../engine/types";
import { translationKeySchema } from "./i18n-key.schema";

const familiarIdSchema = z.enum(["mesange_radar", "herisson_kevlar", "bourdon_bourru", "taupe_secrete"]);

const bonusDrawFirstTurnSchema = z.strictObject({
  kind: z.literal("bonusDrawFirstTurn"),
  amount: z.number().int().positive(),
});
const bonusBlockFirstTurnSchema = z.strictObject({
  kind: z.literal("bonusBlockFirstTurn"),
  amount: z.number().int().positive(),
});
const damageRandomEnemyEndOfTurnSchema = z.strictObject({
  kind: z.literal("damageRandomEnemyEndOfTurn"),
  amount: z.number().int().positive(),
});
const bonusEnergyEveryNTurnsSchema = z.strictObject({
  kind: z.literal("bonusEnergyEveryNTurns"),
  amount: z.number().int().positive(),
  everyNTurns: z.number().int().positive(),
});

export const familiarPassiveSchema: z.ZodType<FamiliarPassive> = z.discriminatedUnion("kind", [
  bonusDrawFirstTurnSchema,
  bonusBlockFirstTurnSchema,
  damageRandomEnemyEndOfTurnSchema,
  bonusEnergyEveryNTurnsSchema,
]);

export const familiarDefinitionSchema: z.ZodType<FamiliarDefinition> = z.strictObject({
  id: familiarIdSchema,
  nameKey: translationKeySchema,
  passive: familiarPassiveSchema,
  signatureCardId: z.string().min(1),
});
