import { motion } from "framer-motion";

export interface ConfirmDialogProps {
  readonly testId: string;
  readonly title: string;
  readonly body: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * Gabarit de confirmation générique — extrait quand un 2ᵉ site d'appel
 * (réinitialisation de la progression, Phase 8 lot 2) a rendu la
 * duplication complète du template moins défendable qu'un partage.
 * Textes/labels fournis par l'appelant : ce composant ne connaît aucune
 * clé i18n précise.
 */
export function ConfirmDialog({ testId, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid={testId}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/90 px-6 text-center text-stone-100"
    >
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-stone-300">{body}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-stone-700 px-5 py-2 font-semibold">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-amber-600 px-5 py-2 font-semibold text-stone-950"
        >
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  );
}
