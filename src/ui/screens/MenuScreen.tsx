import { t } from "../../content/i18n/t";
import { useCombatStore } from "../store/combat-store";
import { useRunStore } from "../store/run-store";

export interface MenuScreenProps {
  readonly onStartCombat: () => void;
  readonly onStartRun: () => void;
}

export function MenuScreen({ onStartCombat, onStartRun }: MenuScreenProps) {
  const startNewCombat = useCombatStore((s) => s.startNewCombat);
  const startNewRun = useRunStore((s) => s.startNewRun);

  const handleStartCombat = () => {
    startNewCombat(Date.now());
    onStartCombat();
  };

  const handleStartRun = () => {
    startNewRun(Date.now());
    onStartRun();
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-stone-100">
      <h1 className="text-3xl font-bold">{t("app.title")}</h1>
      <p className="text-lg text-amber-400">{t("app.subtitle")}</p>
      <p className="text-sm text-stone-400">{t("ui.menu.subtitle")}</p>
      <div className="mt-4 flex flex-col gap-3">
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
      </div>
    </main>
  );
}
