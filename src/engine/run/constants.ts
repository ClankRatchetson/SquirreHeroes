/**
 * 9 floors : assez pour plusieurs occurrences de chaque type de nœud sans
 * une run à rallonge, ajustable sans réécriture de l'algorithme.
 */
export const FLOOR_COUNT = 9;
export const NODES_PER_FLOOR_MIN = 2;
export const NODES_PER_FLOOR_MAX = 4;
export const ELITE_MIN_FLOOR = 3;
/** Garantit un feu de camp avant l'affrontement final. */
export const GUARANTEED_CAMPFIRE_FLOOR = FLOOR_COUNT - 3;

export type WeightedNodeType = "combat" | "evenement" | "boutique" | "feu_de_camp" | "elite";

export const NODE_TYPE_WEIGHTS: Readonly<Record<WeightedNodeType, number>> = {
  combat: 45,
  evenement: 20,
  boutique: 15,
  feu_de_camp: 10,
  elite: 10,
};
