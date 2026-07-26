import noisetteExplosive from "./noisette_explosive.json";
import coupDeBoutoir from "./coup_de_boutoir.json";
import murDeRonces from "./mur_de_ronces.json";
import grognementFeroce from "./grognement_feroce.json";
import rageDuTerrier from "./rage_du_terrier.json";
import carapaceDeGranit from "./carapace_de_granit.json";
import coupDeGrace from "./coup_de_grace.json";
import instinctDuFauve from "./instinct_du_fauve.json";
import ecrasementSismique from "./ecrasement_sismique.json";
import flairDuFourre from "./flair_du_fourre.json";
import secondSouffle from "./second_souffle.json";
import toilettage from "./toilettage.json";
import bouclierReflexe from "./bouclier_reflexe.json";
import griffureCroisee from "./griffure_croisee.json";
import coupDeSemonce from "./coup_de_semonce.json";
import type { Card } from "../../engine/types";
import { cardSchema } from "../schemas";
import { loadCatalog } from "../schemas";

const RAW_CARDS: readonly unknown[] = [
  noisetteExplosive,
  coupDeBoutoir,
  murDeRonces,
  grognementFeroce,
  rageDuTerrier,
  carapaceDeGranit,
  coupDeGrace,
  instinctDuFauve,
  ecrasementSismique,
  flairDuFourre,
  secondSouffle,
  toilettage,
  bouclierReflexe,
  griffureCroisee,
  coupDeSemonce,
];

export const CARD_CATALOG: Readonly<Record<string, Card>> = loadCatalog(RAW_CARDS, cardSchema);
