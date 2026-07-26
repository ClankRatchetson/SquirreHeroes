import mulotMasqueJson from "./mulot_masque.json";
import campagnolCagouleJson from "./campagnol_cagoule.json";
import pieKleptomaneJson from "./pie_kleptomane.json";
import type { EnemyDefinition } from "../../engine/types";
import { enemyDefinitionSchema, loadCatalog } from "../schemas";

const RAW_ENEMIES: readonly unknown[] = [mulotMasqueJson, campagnolCagouleJson, pieKleptomaneJson];

export const ENEMY_CATALOG: Readonly<Record<string, EnemyDefinition>> = loadCatalog(
  RAW_ENEMIES,
  enemyDefinitionSchema,
);

function requireEnemy(id: string): EnemyDefinition {
  const enemy = ENEMY_CATALOG[id];
  if (!enemy) {
    throw new Error(`Contenu manquant : ennemi "${id}" introuvable dans ENEMY_CATALOG.`);
  }
  return enemy;
}

export const MULOT_MASQUE: EnemyDefinition = requireEnemy("mulot_masque");
export const CAMPAGNOL_CAGOULE: EnemyDefinition = requireEnemy("campagnol_cagoule");
export const PIE_KLEPTOMANE: EnemyDefinition = requireEnemy("pie_kleptomane");
