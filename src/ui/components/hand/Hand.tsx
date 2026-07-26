import { AnimatePresence } from "framer-motion";
import { getHandView } from "../../../engine/core";
import type { CombatState } from "../../../engine/types";
import { CardView } from "./CardView";

export interface HandProps {
  readonly state: CombatState;
}

/** Main en éventail — `AnimatePresence` anime la sortie d'une carte jouée, `layout` réarrange les restantes. */
export function Hand({ state }: HandProps) {
  const hand = getHandView(state);

  return (
    <div data-play-zone className="flex min-h-40 flex-wrap items-end justify-center gap-2 p-2">
      <AnimatePresence>
        {hand.map(({ instance, card }) => (
          <CardView key={instance.instanceId} instance={instance} card={card} />
        ))}
      </AnimatePresence>
    </div>
  );
}
