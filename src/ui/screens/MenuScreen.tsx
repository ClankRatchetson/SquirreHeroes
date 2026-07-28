import { useState } from "react";
import { t } from "../../content/i18n/t";
import { useCombatStore } from "../store/combat-store";
import { ConfirmDialog } from "../components/feedback/ConfirmDialog";

export interface MenuScreenProps {
  readonly onStartCombat: () => void;
  /** Navigue vers l'écran de sélection de héros — c'est CET écran qui appelle `startNewRun`. */
  readonly onStartHeroSelect: () => void;
  readonly onResumeRun: () => void;
  readonly onOpenCollection: () => void;
  readonly onOpenSettings: () => void;
  /** Une run en cours (non terminée) existe en base — cf. décision Phase 4 : gate aussi la confirmation d'écrasement. */
  readonly canResume: boolean;
}

export function MenuScreen({
  onStartCombat,
  onStartHeroSelect,
  onResumeRun,
  onOpenCollection,
  onOpenSettings,
  canResume,
}: MenuScreenProps) {
  const startNewCombat = useCombatStore((s) => s.startNewCombat);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStartCombat = () => {
    startNewCombat(Date.now());
    onStartCombat();
  };

  const handleStartRun = () => {
    if (canResume) {
      setShowConfirm(true);
      return;
    }
    onStartHeroSelect();
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-stone-100">
      <h1 className="text-3xl font-bold">{t("app.title")}</h1>
      <p className="text-lg text-amber-400">{t("app.subtitle")}</p>
      <p className="text-sm text-stone-400">{t("ui.menu.subtitle")}</p>
      <div className="mt-4 flex flex-col gap-3">
        {canResume && (
          <button
            type="button"
            onClick={onResumeRun}
            className="rounded-md bg-emerald-600 px-6 py-3 font-semibold text-stone-950"
          >
            {t("ui.menu.resumeRun")}
          </button>
        )}
        <button
          type="button"
          onClick={handleStartRun}
          className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
        >
          {t("ui.menu.newRun")}
        </button>
        <button
          type="button"
          onClick={handleStartCombat}
          className="rounded-md bg-stone-700 px-6 py-3 font-semibold text-stone-100"
        >
          {t("ui.menu.newCombat")}
        </button>
        <button
          type="button"
          onClick={onOpenCollection}
          className="rounded-md bg-stone-700 px-6 py-3 font-semibold text-stone-100"
        >
          {t("ui.menu.collection")}
        </button>
        <button
          type="button"
          data-testid="menu-open-settings"
          onClick={onOpenSettings}
          className="rounded-md bg-stone-700 px-6 py-3 font-semibold text-stone-100"
        >
          {t("ui.menu.settings")}
        </button>
      </div>

      <p className="mt-2 text-xs text-stone-600">
        {t("ui.settings.version")} {__APP_VERSION__}
      </p>

      {showConfirm && (
        <ConfirmDialog
          testId="confirm-overwrite"
          title={t("ui.menu.confirmOverwrite.title")}
          body={t("ui.menu.confirmOverwrite.body")}
          confirmLabel={t("ui.menu.confirmOverwrite.confirm")}
          cancelLabel={t("ui.menu.confirmOverwrite.cancel")}
          onConfirm={() => {
            setShowConfirm(false);
            onStartHeroSelect();
          }}
          onCancel={() => {
            setShowConfirm(false);
          }}
        />
      )}
    </main>
  );
}
