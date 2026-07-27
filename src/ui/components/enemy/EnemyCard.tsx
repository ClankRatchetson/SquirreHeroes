import type { EnemyInstance } from "../../../engine/types";
import { tFromContent } from "../../../content/i18n/t";
import { useCombatEventQueue } from "../../hooks/useCombatEventQueue";
import { useCombatController } from "../../combat-controller";
import { StatusTooltip } from "../status/StatusTooltip";
import { FloatingNumber } from "../feedback/FloatingNumber";
import { IntentIcon } from "./IntentIcon";

export interface EnemyCardProps {
  readonly enemy: EnemyInstance;
  readonly isTargetable: boolean;
  readonly isHovered: boolean;
  readonly onSelectTarget: () => void;
}

export function EnemyCard({ enemy, isTargetable, isHovered, onSelectTarget }: EnemyCardProps) {
  const events = useCombatEventQueue(enemy.instanceId);
  const { consumeEvent } = useCombatController();
  const isDead = enemy.hp <= 0;

  return (
    <div
      data-testid="enemy-target"
      data-enemy-instance-id={enemy.instanceId}
      onClick={isTargetable ? onSelectTarget : undefined}
      className={`relative flex w-24 flex-col gap-1 rounded-lg border-2 bg-stone-800 p-2 ${
        isDead ? "opacity-40" : ""
      } ${isHovered ? "border-amber-400" : "border-transparent"} ${isTargetable ? "cursor-pointer" : ""}`}
    >
      <p className="truncate text-xs font-semibold text-stone-200">{tFromContent(enemy.nameKey)}</p>
      <p data-testid="enemy-hp" className="text-xs font-bold text-red-400">
        {enemy.hp}/{enemy.maxHp}
      </p>
      {enemy.block > 0 && <p className="text-xs font-bold text-sky-300">{enemy.block}</p>}
      {!isDead && (
        <div className="flex items-center gap-1">
          <IntentIcon move={enemy.intent} />
          <span className="truncate text-[10px] text-stone-400">{tFromContent(enemy.intent.nameKey)}</span>
        </div>
      )}
      {enemy.statuses.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {enemy.statuses.map((status) => (
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
