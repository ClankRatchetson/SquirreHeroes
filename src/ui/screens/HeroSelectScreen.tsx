import { useState } from "react";
import { t, tFromContent } from "../../content/i18n/t";
import { HERO_CATALOG } from "../../content/heroes";
import { META_TREE } from "../../content/meta-tree";
import { aggregateTreeBonuses } from "../../engine/meta";
import type { HeroId } from "../../engine/types";
import { useMetaStore } from "../store/meta-store";
import { useRunStore } from "../store/run-store";

export interface HeroSelectScreenProps {
  readonly onRunStarted: () => void;
  readonly onBack: () => void;
}

/**
 * Ordre d'affichage explicite plutôt qu'implicite (ordre d'insertion de
 * `HERO_CATALOG`) — Casse-Noix toujours en premier (héros de départ,
 * déverrouillé par défaut).
 */
const HERO_DISPLAY_ORDER: readonly HeroId[] = ["casse_noix", "captain_cabriole"];

/** Un héros est verrouillé s'il n'est pas Casse-Noix et que l'Acte I n'est pas encore terminé (Canal A, cf. Phase 5). */
function isHeroLocked(heroId: HeroId, actICompleted: boolean): boolean {
  return heroId !== "casse_noix" && !actICompleted;
}

export function HeroSelectScreen({ onRunStarted, onBack }: HeroSelectScreenProps) {
  const meta = useMetaStore((s) => s.meta);
  const startNewRun = useRunStore((s) => s.startNewRun);
  const [selectedHeroId, setSelectedHeroId] = useState<HeroId>("casse_noix");

  const handleStart = () => {
    const hero = HERO_CATALOG[selectedHeroId];
    if (!hero) {
      return;
    }
    const bonuses = aggregateTreeBonuses(meta, META_TREE);
    startNewRun(Date.now(), bonuses, hero);
    onRunStarted();
  };

  return (
    <main className="flex min-h-dvh flex-col gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-xl font-bold">{t("ui.heroSelect.title")}</h2>

      <div className="flex flex-col gap-3">
        {HERO_DISPLAY_ORDER.flatMap((heroId) => {
          const hero = HERO_CATALOG[heroId];
          if (!hero) {
            return [];
          }
          const locked = isHeroLocked(heroId, meta.actICompleted);
          const selected = selectedHeroId === heroId;
          return [
            <button
              key={heroId}
              type="button"
              disabled={locked}
              data-testid={`hero-select-card-${heroId}`}
              onClick={() => {
                setSelectedHeroId(heroId);
              }}
              className={`flex flex-col gap-2 rounded-lg border-2 p-4 text-left ${
                locked
                  ? "border-stone-700 opacity-60"
                  : selected
                    ? "border-amber-400"
                    : "border-stone-600"
              }`}
            >
              <span className="text-lg font-semibold">{tFromContent(hero.nameKey)}</span>
              {locked && (
                <span className="text-sm text-stone-400">
                  {t("ui.heroSelect.locked")} — {t("ui.heroSelect.unlockActI")}
                </span>
              )}
            </button>,
          ];
        })}
      </div>

      <button
        type="button"
        data-testid="hero-select-start"
        onClick={handleStart}
        className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
      >
        {t("ui.heroSelect.start")}
      </button>

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
