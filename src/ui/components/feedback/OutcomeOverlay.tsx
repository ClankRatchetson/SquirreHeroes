import { motion } from "framer-motion";
import { t } from "../../../content/i18n/t";

export interface OutcomeOverlayProps {
  readonly outcome: "victoire" | "defaite";
  readonly onReplay: () => void;
}

export function OutcomeOverlay({ outcome, onReplay }: OutcomeOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="combat-outcome"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/90 text-stone-100"
    >
      <h2 className="text-3xl font-bold">
        {outcome === "victoire" ? t("ui.outcome.victory") : t("ui.outcome.defeat")}
      </h2>
      <button
        type="button"
        onClick={onReplay}
        className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
      >
        {t("ui.outcome.replay")}
      </button>
    </motion.div>
  );
}
