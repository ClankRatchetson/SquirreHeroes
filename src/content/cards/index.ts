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
import griffeEclair from "./griffe_eclair.json";
import esquiveFeline from "./esquive_feline.json";
import coupDOeil from "./coup_d_oeil.json";
import reflexeDuGamin from "./reflexe_du_gamin.json";
import lancerDeGland from "./lancer_de_gland.json";
import rouladeArriere from "./roulade_arriere.json";
import cordeALinge from "./corde_a_linge.json";
import crocEnJambe from "./croc_en_jambe.json";
import piedLeger from "./pied_leger.json";
import pasDeDeux from "./pas_de_deux.json";
import feinteBasse from "./feinte_basse.json";
import comboDuCapitaine from "./combo_du_capitaine.json";
import sacAMalices from "./sac_a_malices.json";
import diversion from "./diversion.json";
import grandFinalDuCapitaine from "./grand_final_du_capitaine.json";
import tourbillonAcrobatique from "./tourbillon_acrobatique.json";
import piqureToxique from "./piqure_toxique.json";
import blouseRenforcee from "./blouse_renforcee.json";
import diagnostic from "./diagnostic.json";
import fioleCorrosive from "./fiole_corrosive.json";
import poudreIrritante from "./poudre_irritante.json";
import griffeEmpoisonnee from "./griffe_empoisonnee.json";
import boguePiquante from "./bogue_piquante.json";
import remedeDeFortune from "./remede_de_fortune.json";
import analyseClinique from "./analyse_clinique.json";
import espritCalculateur from "./esprit_calculateur.json";
import poisonConcentre from "./poison_concentre.json";
import bogueExplosive from "./bogue_explosive.json";
import piegeABogues from "./piege_a_bogues.json";
import derivatif from "./derivatif.json";
import overdose from "./overdose.json";
import chimieDuChaos from "./chimie_du_chaos.json";
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
  griffeEclair,
  esquiveFeline,
  coupDOeil,
  reflexeDuGamin,
  lancerDeGland,
  rouladeArriere,
  cordeALinge,
  crocEnJambe,
  piedLeger,
  pasDeDeux,
  feinteBasse,
  comboDuCapitaine,
  sacAMalices,
  diversion,
  grandFinalDuCapitaine,
  tourbillonAcrobatique,
  piqureToxique,
  blouseRenforcee,
  diagnostic,
  fioleCorrosive,
  poudreIrritante,
  griffeEmpoisonnee,
  boguePiquante,
  remedeDeFortune,
  analyseClinique,
  espritCalculateur,
  poisonConcentre,
  bogueExplosive,
  piegeABogues,
  derivatif,
  overdose,
  chimieDuChaos,
];

export const CARD_CATALOG: Readonly<Record<string, Card>> = loadCatalog(RAW_CARDS, cardSchema);
