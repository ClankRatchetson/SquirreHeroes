import { z } from "zod";
import type { RunEffectSpec } from "../../engine/types";

const runDamageSchema = z.strictObject({ kind: z.literal("damage"), amount: z.number().int().positive() });
const runHealSchema = z.strictObject({ kind: z.literal("heal"), amount: z.number().int().positive() });
const runGainNoisettesSchema = z.strictObject({
  kind: z.literal("gainNoisettes"),
  amount: z.number().int().positive(),
});
const runLoseNoisettesSchema = z.strictObject({
  kind: z.literal("loseNoisettes"),
  amount: z.number().int().positive(),
});
const runAddCardToDeckSchema = z.strictObject({ kind: z.literal("addCardToDeck"), cardId: z.string().min(1) });

/**
 * Vocabulaire d'effets de run — 5 primitives, miroir exact de
 * `/src/engine/types/run-effect.ts`. Ne valide PAS `addCardToDeck.cardId`
 * contre `CARD_CATALOG` ici : ce serait un import circulaire
 * (`content/cards` → `content/schemas` (barrel) → ce fichier →
 * `content/cards`). Cette vérification croisée vit dans
 * `tests/content/events.test.ts`, comme le fait déjà le projet pour
 * `HeroDefinition.startingDeck` (cf. `tests/content/heroes.test.ts`).
 */
export const runEffectSpecSchema: z.ZodType<RunEffectSpec> = z.discriminatedUnion("kind", [
  runDamageSchema,
  runHealSchema,
  runGainNoisettesSchema,
  runLoseNoisettesSchema,
  runAddCardToDeckSchema,
]);
