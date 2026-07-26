import { t } from "../../../content/i18n/t";

export interface EnergyBarProps {
  readonly current: number;
  readonly max: number;
}

export function EnergyBar({ current, max }: EnergyBarProps) {
  return (
    <div data-testid="energy-bar" className="flex items-center gap-2">
      <span className="text-xs text-stone-400">{t("ui.combat.energyLabel")}</span>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full ${index < current ? "bg-amber-400" : "bg-stone-700"}`}
          />
        ))}
      </div>
    </div>
  );
}
