import noyerAncestralJson from "./noyer_ancestral.json";
import fontaineMoussueJson from "./fontaine_moussue.json";
import marchandAmbulantJson from "./marchand_ambulant.json";
import type { EventDefinition } from "../../engine/types";
import { eventDefinitionSchema, loadCatalog } from "../schemas";

const RAW_EVENTS: readonly unknown[] = [noyerAncestralJson, fontaineMoussueJson, marchandAmbulantJson];

export const EVENT_CATALOG: Readonly<Record<string, EventDefinition>> = loadCatalog(RAW_EVENTS, eventDefinitionSchema);
