import { z } from "zod";
import type { HeroDefinition } from "../../engine/types";
import { translationKeySchema } from "./i18n-key.schema";

const heroIdSchema = z.literal("casse_noix");

export const heroDefinitionSchema: z.ZodType<HeroDefinition> = z.strictObject({
  id: heroIdSchema,
  nameKey: translationKeySchema,
  maxHp: z.number().int().positive(),
  startingDeck: z.array(z.string().min(1)).min(1),
});
