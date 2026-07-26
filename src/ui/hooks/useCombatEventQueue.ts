import { useMemo } from "react";
import { useCombatStore } from "../store/combat-store";
import type { CombatDisplayEvent } from "../store/combat-store.types";

/** Événements d'affichage en attente pour une cible donnée ("hero" ou un `EnemyInstance.instanceId`). */
export function useCombatEventQueue(targetId: string): readonly CombatDisplayEvent[] {
  const pendingEvents = useCombatStore((s) => s.pendingEvents);
  return useMemo(() => pendingEvents.filter((e) => e.targetId === targetId), [pendingEvents, targetId]);
}
