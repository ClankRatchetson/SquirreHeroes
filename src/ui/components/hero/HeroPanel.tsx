import type { HeroState } from "../../../engine/types";
import { t, tFromContent } from "../../../content/i18n/t";
import { useCombatEventQueue } from "../../hooks/useCombatEventQueue";
import { useCombatStore } from "../../store/combat-store";
import { StatusTooltip } from "../status/StatusTooltip";
import { FloatingNumber } from "../feedback/FloatingNumber";

export interface HeroPanelProps {
  readonly hero: HeroState;
  readonly nameKey: string;
}

export function HeroPanel({ hero, nameKey }: HeroPanelProps) {
  const events = useCombatEventQueue("hero");
  const consumeEvent = useCombatStore((s) => s.consumeEvent);

  return (
    <div data-testid="hero-panel" className="relative flex flex-col gap-2 rounded-lg bg-stone-800 p-3">
      <p className="text-sm font-semibold text-stone-200">{tFromContent(nameKey)}</p>
      <div className="flex items-center gap-4 text-sm text-stone-100">
        <span data-testid="hero-hp" className="font-bold text-red-400">
          {t("ui.combat.hpLabel")} {hero.hp}/{hero.maxHp}
        </span>
        {hero.block > 0 && (
          <span className="font-bold text-sky-300">
            {t("ui.combat.blockLabel")} {hero.block}
          </span>
        )}
      </div>
      {hero.statuses.length > 0 && (
        <div className="flex gap-1">
          {hero.statuses.map((status) => (
            <StatusTooltip key={status.id} status={status} />
          ))}
        </div>
      )}
      {events.map((event) => (
        <FloatingNumber
          key={event.id}
          event={event}
          onComplete={() => {
            consumeEvent(event.id);
          }}
        />
      ))}
    </div>
  );
}
