import { useState } from "react";
import type { PanInfo } from "framer-motion";
import { motion } from "framer-motion";
import { isCardPlayable } from "../../../engine/core";
import type { Card, CardInstance } from "../../../engine/types";
import { tFromContent } from "../../../content/i18n/t";
import { cardNeedsEnemyTarget, isCardVisuallyPlayable } from "../../card-target";
import { useCombatController } from "../../combat-controller";
import { CARD_RESOLVE_MS } from "../../animation/timing";

export interface CardViewProps {
  readonly instance: CardInstance;
  readonly card: Card;
}

function findHoveredEnemyId(point: { readonly x: number; readonly y: number }): string | null {
  const el = document.elementFromPoint(point.x, point.y);
  const enemyEl = el?.closest<HTMLElement>("[data-enemy-instance-id]");
  return enemyEl?.dataset.enemyInstanceId ?? null;
}

/** Une carte de la main : tap-select, drag, désactivée si non jouable. */
export function CardView({ instance, card }: CardViewProps) {
  const { engineState, isResolvingEnemyTurn, targeting, selectCard, hoverEnemy, playCard } = useCombatController();
  const selectedCardInstanceId = targeting.selectedCardInstanceId;

  const needsTarget = cardNeedsEnemyTarget(card, instance.upgraded);
  const playable =
    engineState !== null && !isResolvingEnemyTurn && isCardVisuallyPlayable(engineState, instance, card);
  const isSelected = selectedCardInstanceId === instance.instanceId;
  const displayName = tFromContent(instance.upgraded && card.upgraded ? card.upgraded.nameKey : card.nameKey);

  const handleTap = () => {
    if (!playable) {
      return;
    }
    if (!needsTarget) {
      playCard(instance.instanceId);
      return;
    }
    selectCard(isSelected ? null : instance.instanceId);
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!playable || !needsTarget) {
      return;
    }
    const enemyId = findHoveredEnemyId(info.point);
    if (enemyId && isCardPlayable(engineState, instance.instanceId, enemyId)) {
      hoverEnemy(enemyId);
    } else {
      hoverEnemy(null);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    hoverEnemy(null);
    if (!playable) {
      return;
    }
    if (!needsTarget) {
      const el = document.elementFromPoint(info.point.x, info.point.y);
      if (el?.closest("[data-play-zone]")) {
        playCard(instance.instanceId);
      }
      return;
    }
    const enemyId = findHoveredEnemyId(info.point);
    if (enemyId && isCardPlayable(engineState, instance.instanceId, enemyId)) {
      playCard(instance.instanceId, enemyId);
    }
  };

  return (
    <motion.div
      layout
      drag={playable}
      dragSnapToOrigin
      dragElastic={0.15}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      data-testid="card-in-hand"
      data-playable={playable}
      data-needs-target={needsTarget}
      data-selected={isSelected}
      style={{ pointerEvents: isDragging ? "none" : undefined }}
      animate={isSelected ? { y: -12 } : { y: 0 }}
      exit={{ opacity: 0, y: 40, transition: { duration: CARD_RESOLVE_MS / 1000 } }}
      className={`flex h-36 w-24 flex-col justify-between rounded-lg border-2 bg-stone-800 p-2 text-stone-100 ${
        playable ? "cursor-grab" : "pointer-events-none opacity-40"
      } ${isSelected ? "border-amber-400" : "border-stone-600"}`}
    >
      <span className="self-start rounded-full bg-stone-700 px-1.5 text-xs font-bold">{card.cost}</span>
      <p className="text-center text-xs font-semibold">{displayName}</p>
    </motion.div>
  );
}
