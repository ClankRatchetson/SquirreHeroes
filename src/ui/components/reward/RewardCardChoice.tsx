import { tFromContent } from "../../../content/i18n/t";
import type { Card } from "../../../engine/types";

export interface RewardCardChoiceProps {
  readonly card: Card;
  readonly onChoose: () => void;
}

/** Carte d'offre de récompense — pas de drag/ciblage, `CardView` est trop spécifique au combat pour être réutilisé ici. */
export function RewardCardChoice({ card, onChoose }: RewardCardChoiceProps) {
  return (
    <button
      type="button"
      data-testid="reward-card-choice"
      onClick={onChoose}
      className="flex h-36 w-24 flex-col justify-between rounded-lg border-2 border-stone-600 bg-stone-800 p-2 text-stone-100"
    >
      <span className="self-start rounded-full bg-stone-700 px-1.5 text-xs font-bold">{card.cost}</span>
      <p className="text-center text-xs font-semibold">{tFromContent(card.nameKey)}</p>
    </button>
  );
}
