import casseNoixJson from "./casse_noix.json";
import captainCabrioleJson from "./captain_cabriole.json";
import docteurBogueJson from "./docteur_bogue.json";
import type { HeroDefinition } from "../../engine/types";
import { heroDefinitionSchema, loadCatalog } from "../schemas";

const RAW_HEROES: readonly unknown[] = [casseNoixJson, captainCabrioleJson, docteurBogueJson];

export const HERO_CATALOG: Readonly<Record<string, HeroDefinition>> = loadCatalog(
  RAW_HEROES,
  heroDefinitionSchema,
);

const casseNoix = HERO_CATALOG.casse_noix;
if (!casseNoix) {
  throw new Error("Contenu manquant : héros casse_noix introuvable dans HERO_CATALOG.");
}
export const CASSE_NOIX: HeroDefinition = casseNoix;

const captainCabriole = HERO_CATALOG.captain_cabriole;
if (!captainCabriole) {
  throw new Error("Contenu manquant : héros captain_cabriole introuvable dans HERO_CATALOG.");
}
export const CAPTAIN_CABRIOLE: HeroDefinition = captainCabriole;

const docteurBogue = HERO_CATALOG.docteur_bogue;
if (!docteurBogue) {
  throw new Error("Contenu manquant : héros docteur_bogue introuvable dans HERO_CATALOG.");
}
export const DOCTEUR_BOGUE: HeroDefinition = docteurBogue;
