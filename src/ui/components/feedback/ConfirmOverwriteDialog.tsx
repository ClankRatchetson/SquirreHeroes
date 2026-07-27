import { motion } from "framer-motion";
import { t } from "../../../content/i18n/t";

export interface ConfirmOverwriteDialogProps {
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** Confirmation avant d'écraser une run reprenable — même gabarit que `OutcomeOverlay`/`RunOutcomeOverlay`. */
export function ConfirmOverwriteDialog({ onConfirm, onCancel }: ConfirmOverwriteDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="confirm-overwrite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/90 px-6 text-center text-stone-100"
    >
      <h2 className="text-xl font-bold">{t("ui.menu.confirmOverwrite.title")}</h2>
      <p className="text-sm text-stone-300">{t("ui.menu.confirmOverwrite.body")}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-stone-700 px-5 py-2 font-semibold">
          {t("ui.menu.confirmOverwrite.cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-amber-600 px-5 py-2 font-semibold text-stone-950"
        >
          {t("ui.menu.confirmOverwrite.confirm")}
        </button>
      </div>
    </motion.div>
  );
}
