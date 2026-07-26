import { t } from "../../content/i18n/t";
import { useCombatStore } from "../store/combat-store";

export interface MenuScreenProps {
  readonly onStart: () => void;
}

export function MenuScreen({ onStart }: MenuScreenProps) {
  const startNewCombat = useCombatStore((s) => s.startNewCombat);

  const handleStart = () => {
    startNewCombat(Date.now());
    onStart();
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-stone-100">
      <h1 className="text-3xl font-bold">{t("app.title")}</h1>
      <p className="text-lg text-amber-400">{t("app.subtitle")}</p>
      <p className="text-sm text-stone-400">{t("ui.menu.subtitle")}</p>
      <button
        type="button"
        onClick={handleStart}
        className="mt-4 rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
      >
        {t("ui.menu.newCombat")}
      </button>
    </main>
  );
}
