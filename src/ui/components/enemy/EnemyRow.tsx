import { isCardPlayable } from "../../../engine/core";
import type { EnemyInstance } from "../../../engine/types";
import { useCombatStore } from "../../store/combat-store";
import { EnemyCard } from "./EnemyCard";

export interface EnemyRowProps {
  readonly enemies: readonly EnemyInstance[];
}

export function EnemyRow({ enemies }: EnemyRowProps) {
  const engineState = useCombatStore((s) => s.engineState);
  const targeting = useCombatStore((s) => s.targeting);
  const playCard = useCombatStore((s) => s.playCard);

  const selectedCardInstanceId = targeting.selectedCardInstanceId;

  return (
    <div className="flex justify-center gap-2">
      {enemies.map((enemy) => {
        const isTargetable =
          selectedCardInstanceId !== null &&
          engineState !== null &&
          isCardPlayable(engineState, selectedCardInstanceId, enemy.instanceId);

        return (
          <EnemyCard
            key={enemy.instanceId}
            enemy={enemy}
            isTargetable={isTargetable}
            isHovered={targeting.hoveredEnemyInstanceId === enemy.instanceId}
            onSelectTarget={() => {
              if (selectedCardInstanceId !== null) {
                playCard(selectedCardInstanceId, enemy.instanceId);
              }
            }}
          />
        );
      })}
    </div>
  );
}
