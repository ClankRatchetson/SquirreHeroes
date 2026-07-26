import type { StatusInstance } from "../types";
import { getStacks } from "./status-list";

/**
 * Formules mécaniques des altérations d'état (§4.3 des specs). Ordre
 * volontaire : bonus/malus à plat (Force, Leste) d'abord, puis pourcentage
 * (Étourdi, À découvert, Coquille fêlée), puis un seul arrondi final.
 */

export function computeOutgoingDamage(
  baseAmount: number,
  attackerStatuses: readonly StatusInstance[],
): number {
  const withForce = baseAmount + getStacks(attackerStatuses, "force");
  const withEtourdi = getStacks(attackerStatuses, "etourdi") > 0 ? withForce * 0.75 : withForce;
  return Math.max(0, Math.round(withEtourdi));
}

export interface IncomingDamageResult {
  readonly damageToHp: number;
  readonly remainingBlock: number;
}

export function computeIncomingDamage(
  rawAmount: number,
  defenderStatuses: readonly StatusInstance[],
  defenderBlock: number,
): IncomingDamageResult {
  const withADecouvert = getStacks(defenderStatuses, "a_decouvert") > 0 ? rawAmount * 1.5 : rawAmount;
  const finalAmount = Math.max(0, Math.round(withADecouvert));
  const blockConsumed = Math.min(defenderBlock, finalAmount);
  return {
    damageToHp: finalAmount - blockConsumed,
    remainingBlock: defenderBlock - blockConsumed,
  };
}

/**
 * Leste ne s'applique qu'aux effets `block` résolus dans le cadre d'une
 * carte de type "defense" — jamais sur un move ennemi (qui n'a pas de
 * "type de carte"), comportement volontaire et non une lacune.
 */
export function computeOutgoingBlock(
  baseAmount: number,
  casterStatuses: readonly StatusInstance[],
  isDefenseCard: boolean,
): number {
  const withLeste = baseAmount + (isDefenseCard ? getStacks(casterStatuses, "leste") : 0);
  const withCoquille =
    getStacks(casterStatuses, "coquille_fetee") > 0 ? withLeste * 0.75 : withLeste;
  return Math.max(0, Math.round(withCoquille));
}

/** Dégâts subis à l'HP sans passer par le blocage — utilisé par les DoT et les Piquants. */
export function applyRawHpDamage(hp: number, amount: number): number {
  return Math.max(0, hp - Math.max(0, amount));
}

export function applyHeal(hp: number, maxHp: number, amount: number): number {
  return Math.min(maxHp, hp + Math.max(0, amount));
}
