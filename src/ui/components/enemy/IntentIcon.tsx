import type { EnemyMoveDef } from "../../../engine/types";

type IntentCategory = "attack" | "block" | "status" | "unknown";

interface IntentSummary {
  readonly category: IntentCategory;
  readonly amount: number;
}

/** Résumé purement présentationnel d'un move (kinds -> pictogramme), aucune règle de jeu. */
function summarizeIntent(move: EnemyMoveDef): IntentSummary {
  let totalDamage = 0;
  let totalBlock = 0;
  let hasStatus = false;

  for (const effect of move.effects) {
    switch (effect.kind) {
      case "damage":
      case "damageAll":
        totalDamage += effect.amount;
        break;
      case "multiHit":
        totalDamage += effect.hits * effect.amountPerHit;
        break;
      case "block":
        totalBlock += effect.amount;
        break;
      case "applyStatus":
      case "doubleStatus":
        hasStatus = true;
        break;
      default:
        break;
    }
  }

  if (totalDamage > 0) {
    return { category: "attack", amount: totalDamage };
  }
  if (totalBlock > 0) {
    return { category: "block", amount: totalBlock };
  }
  if (hasStatus) {
    return { category: "status", amount: 0 };
  }
  return { category: "unknown", amount: 0 };
}

const CATEGORY_COLOR: Record<IntentCategory, string> = {
  attack: "bg-red-600",
  block: "bg-sky-600",
  status: "bg-purple-600",
  unknown: "bg-stone-600",
};

export interface IntentIconProps {
  readonly move: EnemyMoveDef;
}

export function IntentIcon({ move }: IntentIconProps) {
  const { category, amount } = summarizeIntent(move);
  return (
    <span
      data-testid="enemy-intent-icon"
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-bold text-white ${CATEGORY_COLOR[category]}`}
    >
      {amount > 0 ? amount : "?"}
    </span>
  );
}
