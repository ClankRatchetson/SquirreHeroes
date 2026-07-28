import noyerAncestralJson from "./noyer_ancestral.json";
import fontaineMoussueJson from "./fontaine_moussue.json";
import marchandAmbulantJson from "./marchand_ambulant.json";
import ruisseauGeleJson from "./ruisseau_gele.json";
import cachetteDeProvisionsJson from "./cachette_de_provisions.json";
import etabliAbandonneJson from "./etabli_abandonne.json";
import vieuxBlaireauSageJson from "./vieux_blaireau_sage.json";
import rucheAbandonneeJson from "./ruche_abandonnee.json";
import concoursDeGlandsJson from "./concours_de_glands.json";
import cabaneAOutilsJson from "./cabane_a_outils.json";
import nidAbandonneJson from "./nid_abandonne.json";
import guerisseuseItineranteJson from "./guerisseuse_itinerante.json";
import vieuxPiegeRouilleJson from "./vieux_piege_rouille.json";
import clairiereSilencieuseJson from "./clairiere_silencieuse.json";
import terrierEncombreJson from "./terrier_encombre.json";
import type { EventDefinition } from "../../engine/types";
import { eventDefinitionSchema, loadCatalog } from "../schemas";

const RAW_EVENTS: readonly unknown[] = [
  noyerAncestralJson,
  fontaineMoussueJson,
  marchandAmbulantJson,
  ruisseauGeleJson,
  cachetteDeProvisionsJson,
  etabliAbandonneJson,
  vieuxBlaireauSageJson,
  rucheAbandonneeJson,
  concoursDeGlandsJson,
  cabaneAOutilsJson,
  nidAbandonneJson,
  guerisseuseItineranteJson,
  vieuxPiegeRouilleJson,
  clairiereSilencieuseJson,
  terrierEncombreJson,
];

export const EVENT_CATALOG: Readonly<Record<string, EventDefinition>> = loadCatalog(RAW_EVENTS, eventDefinitionSchema);
