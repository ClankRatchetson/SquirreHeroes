import { z } from "zod";
import type { EnemyDefinition, EnemyMoveDef } from "../../engine/types";
import { effectSpecSchema } from "./effect.schema";
import { translationKeySchema } from "./i18n-key.schema";

const enemyMoveDefSchema: z.ZodType<EnemyMoveDef> = z.strictObject({
  id: z.string().min(1),
  nameKey: translationKeySchema,
  effects: z.array(effectSpecSchema),
});

const enemyDefinitionShapeSchema: z.ZodType<EnemyDefinition> = z.strictObject({
  id: z.string().min(1),
  nameKey: translationKeySchema,
  maxHp: z.number().int().positive(),
  moves: z.array(enemyMoveDefSchema).min(1),
  pattern: z.array(z.string().min(1)).min(1),
});

/** Vérifie en plus que chaque id du `pattern` correspond à un move déclaré. */
export const enemyDefinitionSchema = enemyDefinitionShapeSchema.refine(
  (def) => def.pattern.every((moveId) => def.moves.some((m) => m.id === moveId)),
  { message: "Chaque id du pattern doit correspondre à un move déclaré." },
);
