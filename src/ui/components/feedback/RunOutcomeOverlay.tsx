import { motion } from "framer-motion";
import { t } from "../../../content/i18n/t";
import { useRunStore } from "../../store/run-store";

export interface RunOutcomeOverlayProps {
  /** Retour à la sélection de héros — jamais un `startNewRun` direct ici, pour que les bonus de l'arbre de Glands d'Or (Phase 5) s'appliquent à chaque nouvelle run, pas seulement celles démarrées depuis le menu. */
  readonly onNewRun: () => void;
}

/** Distinct de `OutcomeOverlay.tsx` (fin de combat) : marque la fin de la run entière (victoire d'acte ou défaite). */
export function RunOutcomeOverlay({ onNewRun }: RunOutcomeOverlayProps) {
  const outcome = useRunStore((s) => s.runState?.outcome);

  if (outcome !== "victoire" && outcome !== "defaite") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="run-outcome"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/90 text-stone-100"
    >
      <h2 className="text-3xl font-bold">
        {outcome === "victoire" ? t("ui.run.outcome.victory") : t("ui.run.outcome.defeat")}
      </h2>
      <button type="button" onClick={onNewRun} className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950">
        {t("ui.run.outcome.newRun")}
      </button>
    </motion.div>
  );
}
