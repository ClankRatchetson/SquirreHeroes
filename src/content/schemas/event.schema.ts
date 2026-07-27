import { z } from "zod";
import type { EventChoice, EventDefinition } from "../../engine/types";
import { translationKeySchema } from "./i18n-key.schema";
import { runEffectSpecSchema } from "./run-effect.schema";

const eventChoiceSchema: z.ZodType<EventChoice> = z.strictObject({
  id: z.string().min(1),
  labelKey: translationKeySchema,
  effects: z.array(runEffectSpecSchema),
});

export const eventDefinitionSchema: z.ZodType<EventDefinition> = z.strictObject({
  id: z.string().min(1),
  titleKey: translationKeySchema,
  textKey: translationKeySchema,
  choices: z.array(eventChoiceSchema).min(2).max(4),
});
