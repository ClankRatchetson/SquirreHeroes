import { t, tFromContent } from "../../content/i18n/t";
import { CASSE_NOIX } from "../../content/heroes";
import { META_TREE } from "../../content/meta-tree";
import { aggregateTreeBonuses } from "../../engine/meta";
import { useMetaStore } from "../store/meta-store";
import { useRunStore } from "../store/run-store";

export interface HeroSelectScreenProps {
  readonly onRunStarted: () => void;
  readonly onBack: () => void;
}

/**
 * Un seul héros jouable en Phase 5 (Casse-Noix) — le 2ᵉ emplacement est
 * visiblement verrouillé, piloté par `meta.actICompleted` pour l'affichage
 * seulement. Aucun contenu de 2ᵉ héros n'est fabriqué : il arrivera en
 * Phase 7 (cf. décision actée avec l'utilisateur).
 */
export function HeroSelectScreen({ onRunStarted, onBack }: HeroSelectScreenProps) {
  const meta = useMetaStore((s) => s.meta);
  const startNewRun = useRunStore((s) => s.startNewRun);

  const handleStart = () => {
    const bonuses = aggregateTreeBonuses(meta, META_TREE);
    startNewRun(Date.now(), bonuses);
    onRunStarted();
  };

  return (
    <main className="flex min-h-dvh flex-col gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-xl font-bold">{t("ui.heroSelect.title")}</h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-lg border-2 border-amber-400 p-4">
          <span className="text-lg font-semibold">{tFromContent(CASSE_NOIX.nameKey)}</span>
          <button
            type="button"
            data-testid="hero-select-start"
            onClick={handleStart}
            className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
          >
            {t("ui.heroSelect.start")}
          </button>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border-2 border-stone-700 p-4 opacity-60">
          <span className="text-lg font-semibold">{t("ui.heroSelect.locked")}</span>
          <span className="text-sm text-stone-400">
            {meta.actICompleted ? t("ui.heroSelect.comingLater") : t("ui.heroSelect.unlockActI")}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-auto rounded-md bg-stone-700 px-4 py-3 font-semibold text-stone-100"
      >
        {t("ui.menu.back")}
      </button>
    </main>
  );
}
