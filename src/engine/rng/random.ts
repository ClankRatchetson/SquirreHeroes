import { nextFloat, type RngState } from "./mulberry32";

/** Entier dans [0, maxExclusive). `maxExclusive` doit être strictement positif. */
export function nextInt(rng: RngState, maxExclusive: number): readonly [number, RngState] {
  const [value, nextRng] = nextFloat(rng);
  return [Math.floor(value * maxExclusive), nextRng];
}

/** Fisher-Yates piloté par le PRNG — retourne un nouveau tableau, jamais de mutation. */
export function shuffle<T>(rng: RngState, items: readonly T[]): readonly [readonly T[], RngState] {
  const result = [...items];
  let currentRng = rng;
  for (let i = result.length - 1; i > 0; i -= 1) {
    const [j, nextRng] = nextInt(currentRng, i + 1);
    currentRng = nextRng;
    const a = result[i] as T;
    const b = result[j] as T;
    result[i] = b;
    result[j] = a;
  }
  return [result, currentRng];
}
