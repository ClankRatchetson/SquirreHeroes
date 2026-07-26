import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { StatusInstance } from "../../../engine/types";
import { tFromContent } from "../../../content/i18n/t";
import { useLongPress } from "../../hooks/useLongPress";
import { StatusIcon } from "./StatusIcon";

export interface StatusTooltipProps {
  readonly status: StatusInstance;
}

/** Appui long sur l'icône -> infobulle avec le nom et l'effet mécanique exact. */
export function StatusTooltip({ status }: StatusTooltipProps) {
  const [open, setOpen] = useState(false);
  const { onPointerDown, onPointerMove, onPointerUp, onPointerLeave } = useLongPress(
    () => {
      setOpen(true);
    },
    () => {
      setOpen(false);
    },
  );

  return (
    <span
      className="relative inline-block"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => {
        onPointerUp();
        setOpen(false);
      }}
      onPointerLeave={onPointerLeave}
    >
      <StatusIcon status={status} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="tooltip"
            data-testid="status-tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-40 -translate-x-1/2 rounded-md bg-stone-900 p-2 text-xs text-stone-100 shadow-lg"
          >
            <p className="font-semibold">{tFromContent(`statuses.${status.id}.name`)}</p>
            <p>{tFromContent(`statuses.${status.id}.description`)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
