import { z } from "zod";
import type { MetaTreeNode, MetaTreeNodeEffect } from "../../engine/meta";
import { translationKeySchema } from "./i18n-key.schema";

const bonusMaxHpEffectSchema = z.strictObject({ kind: z.literal("bonusMaxHp"), amount: z.number().int().positive() });
const upgradeStartingCardEffectSchema = z.strictObject({
  kind: z.literal("upgradeStartingCard"),
  cardId: z.string().min(1),
});
const noisettesBonusEffectSchema = z.strictObject({
  kind: z.literal("noisettesBonusPerCombat"),
  amount: z.number().int().positive(),
});

/**
 * Vocabulaire d'effets de l'arbre de Glands d'Or — 3 primitives, miroir
 * exact de `/src/engine/meta/types.ts`. Ne valide PAS `cardId` contre
 * `CARD_CATALOG` ici : import circulaire (même précédent que
 * `run-effect.schema.ts` pour `addCardToDeck`). Vérifié dans
 * `tests/content/meta-tree.test.ts`.
 */
export const metaTreeNodeEffectSchema: z.ZodType<MetaTreeNodeEffect> = z.discriminatedUnion("kind", [
  bonusMaxHpEffectSchema,
  upgradeStartingCardEffectSchema,
  noisettesBonusEffectSchema,
]);

export const metaTreeNodeSchema: z.ZodType<MetaTreeNode> = z.strictObject({
  id: z.string().min(1),
  nameKey: translationKeySchema,
  descriptionKey: translationKeySchema,
  cost: z.number().int().positive(),
  prerequisiteId: z.string().min(1).optional(),
  effect: metaTreeNodeEffectSchema,
});
