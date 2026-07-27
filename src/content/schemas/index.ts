import type { z } from "zod";

export * from "./i18n-key.schema";
export * from "./status.schema";
export * from "./effect.schema";
export * from "./card.schema";
export * from "./enemy.schema";
export * from "./hero.schema";
export * from "./run-effect.schema";
export * from "./event.schema";

/**
 * Parse chaque entrée brute avec le schéma fourni (lève si un contenu est
 * malformé — capturé par les tests de contenu ET par le chargement réel de
 * l'app) et les regroupe en catalogue indexé par `id`.
 */
export function loadCatalog<T extends { readonly id: string }>(
  rawItems: readonly unknown[],
  schema: z.ZodType<T>,
): Readonly<Record<string, T>> {
  const catalog: Record<string, T> = {};
  for (const raw of rawItems) {
    const parsed = schema.parse(raw);
    catalog[parsed.id] = parsed;
  }
  return catalog;
}
