import mulotMasqueJson from "./mulot_masque.json";
import campagnolCagouleJson from "./campagnol_cagoule.json";
import pieKleptomaneJson from "./pie_kleptomane.json";
import merleMercenaireJson from "./merle_mercenaire.json";
import baronneBecDeFerJson from "./baronne_bec_de_fer.json";
import griffeurDeGouttiereJson from "./griffeur_de_gouttiere.json";
import fouineFataleJson from "./fouine_fatale.json";
import corvideMasqueJson from "./corvide_masque.json";
import beletteBraqueuseJson from "./belette_braqueuse.json";
import baronGriffuJson from "./baron_griffu.json";
import type { EnemyDefinition } from "../../engine/types";
import { enemyDefinitionSchema, loadCatalog } from "../schemas";

const RAW_ENEMIES: readonly unknown[] = [
  mulotMasqueJson,
  campagnolCagouleJson,
  pieKleptomaneJson,
  merleMercenaireJson,
  baronneBecDeFerJson,
  griffeurDeGouttiereJson,
  fouineFataleJson,
  corvideMasqueJson,
  beletteBraqueuseJson,
  baronGriffuJson,
];

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
export const MERLE_MERCENAIRE: EnemyDefinition = requireEnemy("merle_mercenaire");
export const BARONNE_BEC_DE_FER: EnemyDefinition = requireEnemy("baronne_bec_de_fer");
export const GRIFFEUR_DE_GOUTTIERE: EnemyDefinition = requireEnemy("griffeur_de_gouttiere");
export const FOUINE_FATALE: EnemyDefinition = requireEnemy("fouine_fatale");
export const CORVIDE_MASQUE: EnemyDefinition = requireEnemy("corvide_masque");
export const BELETTE_BRAQUEUSE: EnemyDefinition = requireEnemy("belette_braqueuse");
export const BARON_GRIFFU: EnemyDefinition = requireEnemy("baron_griffu");
