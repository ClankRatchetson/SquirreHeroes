import { useState } from "react";
import { motion } from "framer-motion";
import { t } from "../../../content/i18n/t";

const STEP_KEYS = [
  "ui.tutorial.step1",
  "ui.tutorial.step2",
  "ui.tutorial.step3",
  "ui.tutorial.step4",
  "ui.tutorial.step5",
] as const;

export interface TutorialOverlayProps {
  /** Appelé au dernier "C'est parti !" comme à "Passer le tutoriel" — un seul et même point de sortie. */
  readonly onFinish: () => void;
}

/**
 * Tutoriel de premier combat (Phase 8 lot 1) — même gabarit que
 * `ConfirmOverwriteDialog`/`OutcomeOverlay` : une suite fixe d'étapes
 * textuelles (pas de mise en évidence ancrée au DOM, hors de portée d'un
 * premier lot de tutoriel), sautable à tout moment. N'affiché qu'en mode
 * run (`RunCombatScreen`), jamais en mode combat de démo.
 */
export function TutorialOverlay({ onFinish }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex === STEP_KEYS.length - 1;
  const stepKey = STEP_KEYS[stepIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-testid="tutorial-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/90 px-6 text-center text-stone-100"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
        {t("ui.tutorial.stepLabel")} {stepIndex + 1}/{STEP_KEYS.length}
      </p>
      <p className="max-w-sm text-sm text-stone-200">{stepKey ? t(stepKey) : ""}</p>
      <div className="flex gap-3">
        <button
          type="button"
          data-testid="tutorial-skip"
          onClick={onFinish}
          className="rounded-md bg-stone-700 px-4 py-2 text-sm font-semibold"
        >
          {t("ui.tutorial.skip")}
        </button>
        <button
          type="button"
          data-testid="tutorial-next"
          onClick={() => {
            if (isLastStep) {
              onFinish();
            } else {
              setStepIndex((i) => i + 1);
            }
          }}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-stone-950"
        >
          {isLastStep ? t("ui.tutorial.finish") : t("ui.tutorial.next")}
        </button>
      </div>
    </motion.div>
  );
}
