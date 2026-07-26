import { motion } from "framer-motion";
import type { CombatDisplayEvent, CombatDisplayEventKind } from "../../store/combat-store.types";
import { FLASH_MS } from "../../animation/timing";

const KIND_COLOR: Record<CombatDisplayEventKind, string> = {
  damage: "text-red-400",
  block: "text-sky-300",
  heal: "text-emerald-400",
};

const KIND_SIGN: Record<CombatDisplayEventKind, string> = {
  damage: "-",
  block: "+",
  heal: "+",
};

export interface FloatingNumberProps {
  readonly event: CombatDisplayEvent;
  readonly onComplete: () => void;
}

/** Nombre qui "vole" au-dessus d'une cible — la valeur réelle (PV/bloc) reste toujours celle d'`engineState`, ceci n'est qu'un effet additif. */
export function FloatingNumber({ event, onComplete }: FloatingNumberProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], y: -24 }}
      transition={{ duration: FLASH_MS / 1000 }}
      onAnimationComplete={onComplete}
      className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-lg font-extrabold ${KIND_COLOR[event.kind]}`}
    >
      {KIND_SIGN[event.kind]}
      {event.amount}
    </motion.div>
  );
}
