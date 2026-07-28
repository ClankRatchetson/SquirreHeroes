import type { RunActConfig } from "../engine/types";

/**
 * Config des pools d'ennemis par acte — centralisée ici (plutôt que
 * dupliquée dans `run-store.ts`/`scripts/sim.ts` comme avant l'Acte II)
 * pour que les deux points d'appel restent en phase. Pas un catalogue JSON
 * validé par Zod comme cartes/ennemis/familiers/événements : ce ne sont que
 * des identifiants de câblage (quel ennemi appartient à quel acte), pas du
 * contenu éditorial.
 */
export const ACT_I: RunActConfig = {
  actId: "acte_1",
  commonEnemyIds: ["mulot_masque", "campagnol_cagoule", "pie_kleptomane"],
  eliteEnemyIds: ["merle_mercenaire"],
  bossEnemyIds: ["baronne_bec_de_fer"],
};

export const ACT_II: RunActConfig = {
  actId: "acte_2",
  commonEnemyIds: ["griffeur_de_gouttiere", "fouine_fatale", "corvide_masque"],
  eliteEnemyIds: ["belette_braqueuse"],
  bossEnemyIds: ["baron_griffu"],
};

export const ACT_III: RunActConfig = {
  actId: "acte_3",
  commonEnemyIds: ["renardeau_chapardeur", "chouette_guetteuse", "putois_fourbe"],
  eliteEnemyIds: ["lynx_solitaire"],
  bossEnemyIds: ["grand_loup_hurleur"],
};

/** Ordre littéral de la run — les 3 actes de la v1.0 sont désormais tous présents. */
export const RUN_ACTS: readonly RunActConfig[] = [ACT_I, ACT_II, ACT_III];
