import { isCardPlayable } from "../../../engine/core";
import type { EnemyInstance } from "../../../engine/types";
import { useCombatController } from "../../combat-controller";
import { EnemyCard } from "./EnemyCard";

export interface EnemyRowProps {
  readonly enemies: readonly EnemyInstance[];
}

export function EnemyRow({ enemies }: EnemyRowProps) {
  const { engineState, targeting, playCard } = useCombatController();

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
