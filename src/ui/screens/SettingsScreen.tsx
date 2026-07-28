import { useState } from "react";
import { t } from "../../content/i18n/t";
import { INITIAL_META_PROGRESSION } from "../../engine/meta";
import { clearSaveFile } from "../../persistence";
import { storageAdapter } from "../persistence/storage";
import { useMetaStore } from "../store/meta-store";
import { useRunStore } from "../store/run-store";
import { ConfirmDialog } from "../components/feedback/ConfirmDialog";

export interface SettingsScreenProps {
  readonly onBack: () => void;
  /** Appelé une fois la progression effacée en base — l'appelant doit aussi oublier tout état de run mis en cache hors de ces deux stores (ex. `App.tsx`). */
  readonly onProgressionReset: () => void;
}

export function SettingsScreen({ onBack, onProgressionReset }: SettingsScreenProps) {
  const resetTutorial = useMetaStore((s) => s.resetTutorial);
  const setMeta = useMetaStore((s) => s.setMeta);
  const resetRun = useRunStore((s) => s.resetRun);
  const [tutorialJustReset, setTutorialJustReset] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReplayTutorial = () => {
    resetTutorial();
    setTutorialJustReset(true);
  };

  const handleConfirmReset = () => {
    setShowConfirmReset(false);
    void clearSaveFile(storageAdapter).then(() => {
      setMeta(INITIAL_META_PROGRESSION);
      resetRun();
      onProgressionReset();
    });
  };

  return (
    <main className="flex min-h-dvh flex-col gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-xl font-bold">{t("ui.settings.title")}</h2>

      <section className="flex flex-col items-start gap-2 rounded-md bg-stone-800 p-3">
        <h3 className="text-lg font-semibold">{t("ui.settings.tutorial.title")}</h3>
        <p className="text-sm text-stone-400">{t("ui.settings.tutorial.description")}</p>
        <button
          type="button"
          data-testid="settings-replay-tutorial"
          onClick={handleReplayTutorial}
          className="rounded-md bg-stone-700 px-4 py-2 text-sm font-semibold text-stone-100"
        >
          {t("ui.settings.tutorial.button")}
        </button>
        {tutorialJustReset && (
          <p data-testid="settings-tutorial-confirmation" className="text-xs text-emerald-400">
            {t("ui.settings.tutorial.confirmation")}
          </p>
        )}
      </section>

      <section className="flex flex-col items-start gap-2 rounded-md bg-stone-800 p-3">
        <h3 className="text-lg font-semibold text-red-400">{t("ui.settings.reset.title")}</h3>
        <p className="text-sm text-stone-400">{t("ui.settings.reset.description")}</p>
        <button
          type="button"
          data-testid="settings-reset-progression"
          onClick={() => {
            setShowConfirmReset(true);
          }}
          className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-stone-100"
        >
          {t("ui.settings.reset.button")}
        </button>
      </section>

      <p className="text-center text-xs text-stone-500">
        {t("ui.settings.version")} {__APP_VERSION__}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-auto rounded-md bg-stone-700 px-4 py-3 font-semibold text-stone-100"
      >
        {t("ui.menu.back")}
      </button>

      {showConfirmReset && (
        <ConfirmDialog
          testId="confirm-reset-progression"
          title={t("ui.settings.reset.confirmTitle")}
          body={t("ui.settings.reset.confirmBody")}
          confirmLabel={t("ui.settings.reset.confirmConfirm")}
          cancelLabel={t("ui.settings.reset.confirmCancel")}
          onConfirm={handleConfirmReset}
          onCancel={() => {
            setShowConfirmReset(false);
          }}
        />
      )}
    </main>
  );
}
