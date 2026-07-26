import casseNoixJson from "./casse_noix.json";
import type { HeroDefinition } from "../../engine/types";
import { heroDefinitionSchema, loadCatalog } from "../schemas";

const RAW_HEROES: readonly unknown[] = [casseNoixJson];

export const HERO_CATALOG: Readonly<Record<string, HeroDefinition>> = loadCatalog(
  RAW_HEROES,
  heroDefinitionSchema,
);

const casseNoix = HERO_CATALOG.casse_noix;
if (!casseNoix) {
  throw new Error("Contenu manquant : héros casse_noix introuvable dans HERO_CATALOG.");
}
export const CASSE_NOIX: HeroDefinition = casseNoix;
