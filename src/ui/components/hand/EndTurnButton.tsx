import { t } from "../../../content/i18n/t";

export interface EndTurnButtonProps {
  readonly disabled: boolean;
  readonly onClick: () => void;
}

export function EndTurnButton({ disabled, onClick }: EndTurnButtonProps) {
  return (
    <button
      type="button"
      data-testid="end-turn-button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950 disabled:opacity-40"
    >
      {t("ui.combat.endTurn")}
    </button>
  );
}
