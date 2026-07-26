import { z } from "zod";
import type { Card, CardUpgrade } from "../../engine/types";
import { effectSpecSchema } from "./effect.schema";
import { translationKeySchema } from "./i18n-key.schema";

const cardOwnerSchema = z.enum(["casse_noix", "neutre"]);
const cardTypeSchema = z.enum(["attaque", "defense", "competence", "pouvoir", "malediction"]);
const raritySchema = z.enum(["commune", "rare", "legendaire"]);

const cardUpgradeSchema: z.ZodType<CardUpgrade> = z.strictObject({
  nameKey: translationKeySchema,
  effects: z.array(effectSpecSchema),
});

/**
 * Miroir exact du schéma JSON figé (§4.4 des specs). `z.ZodType<Card>`
 * force la conformité structurelle avec `/src/engine/types/card.ts`.
 */
export const cardSchema: z.ZodType<Card> = z.strictObject({
  id: z.string().min(1),
  nameKey: translationKeySchema,
  hero: cardOwnerSchema,
  type: cardTypeSchema,
  rarity: raritySchema,
  cost: z.number().int().min(0),
  effects: z.array(effectSpecSchema),
  upgraded: cardUpgradeSchema.optional(),
  art: z.string().min(1).optional(),
  flavorKey: translationKeySchema.optional(),
});
