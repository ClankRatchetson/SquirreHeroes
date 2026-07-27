import mesangeRadarJson from "./mesange_radar.json";
import herissonKevlarJson from "./herisson_kevlar.json";
import bourdonBourruJson from "./bourdon_bourru.json";
import taupeSecreteJson from "./taupe_secrete.json";
import type { FamiliarDefinition } from "../../engine/types";
import { familiarDefinitionSchema, loadCatalog } from "../schemas";

const RAW_FAMILIARS: readonly unknown[] = [
  mesangeRadarJson,
  herissonKevlarJson,
  bourdonBourruJson,
  taupeSecreteJson,
];

export const FAMILIAR_CATALOG: Readonly<Record<string, FamiliarDefinition>> = loadCatalog(
  RAW_FAMILIARS,
  familiarDefinitionSchema,
);

const mesangeRadar = FAMILIAR_CATALOG.mesange_radar;
if (!mesangeRadar) {
  throw new Error("Contenu manquant : familier mesange_radar introuvable dans FAMILIAR_CATALOG.");
}
export const MESANGE_RADAR: FamiliarDefinition = mesangeRadar;

const herissonKevlar = FAMILIAR_CATALOG.herisson_kevlar;
if (!herissonKevlar) {
  throw new Error("Contenu manquant : familier herisson_kevlar introuvable dans FAMILIAR_CATALOG.");
}
export const HERISSON_KEVLAR: FamiliarDefinition = herissonKevlar;

const bourdonBourru = FAMILIAR_CATALOG.bourdon_bourru;
if (!bourdonBourru) {
  throw new Error("Contenu manquant : familier bourdon_bourru introuvable dans FAMILIAR_CATALOG.");
}
export const BOURDON_BOURRU: FamiliarDefinition = bourdonBourru;

const taupeSecrete = FAMILIAR_CATALOG.taupe_secrete;
if (!taupeSecrete) {
  throw new Error("Contenu manquant : familier taupe_secrete introuvable dans FAMILIAR_CATALOG.");
}
export const TAUPE_SECRETE: FamiliarDefinition = taupeSecrete;
