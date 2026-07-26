/**
 * PRNG seedé (mulberry32) porté par la valeur d'état, jamais par un
 * singleton de module. Aucune dépendance externe, déterministe : la même
 * seed produit toujours la même séquence, ce qui rend une run rejouable à
 * l'identique.
 */
export interface RngState {
  readonly state: number;
}

export function createRng(seed: number): RngState {
  return { state: seed >>> 0 };
}

/** Retourne une valeur dans [0, 1) et le nouvel état à réinjecter. */
export function nextFloat(rng: RngState): readonly [number, RngState] {
  const a = (rng.state + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, { state: a }];
}
