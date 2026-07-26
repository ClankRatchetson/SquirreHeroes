import type { EnemyInstance, EnemyMoveDef } from "../types";
import type { RngState } from "../rng";

/**
 * Phase 1 : purement cyclique et déterministe (le pattern ne consomme pas
 * le PRNG, qui est retourné inchangé). Signature déjà prête pour des
 * patterns pondérés en Phase 7 sans changer les appelants.
 */
export function decideNextIntent(
  enemy: EnemyInstance,
  rng: RngState,
): readonly [EnemyMoveDef, RngState] {
  const moveId = enemy.pattern[enemy.movesTaken % enemy.pattern.length];
  const move = moveId !== undefined ? enemy.moves[moveId] : undefined;
  return [move ?? enemy.intent, rng];
}
