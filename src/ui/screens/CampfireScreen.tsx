import { useState } from "react";
import { t, tFromContent } from "../../content/i18n/t";
import { previewCampfireHeal } from "../../engine/run/campfire";
import { getDeckView } from "../../engine/run/selectors";
import { useRunStore } from "../store/run-store";

export function CampfireScreen() {
  const runState = useRunStore((s) => s.runState);
  const dispatch = useRunStore((s) => s.dispatch);
  const [selectedRunCardId, setSelectedRunCardId] = useState<string | null>(null);

  if (!runState) {
    return null;
  }

  const healAmount = previewCampfireHeal(runState);
  const upgradableEntries = getDeckView(runState).filter((entry) => !entry.upgraded && entry.card.upgraded);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-2xl font-bold">{t("ui.run.campfire.title")}</h2>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "FEU_DE_CAMP_SOIGNER" });
        }}
        className="rounded-md bg-amber-600 px-6 py-3 font-semibold text-stone-950"
      >
        {t("ui.run.campfire.heal")} (+{healAmount})
      </button>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-stone-400">{t("ui.run.campfire.upgradeSection")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {upgradableEntries.map(({ runCardId, card }) => (
            <button
              key={runCardId}
              type="button"
              onClick={() => {
                setSelectedRunCardId(runCardId);
              }}
              className={`rounded-md border-2 px-3 py-2 text-xs ${
                selectedRunCardId === runCardId ? "border-amber-400" : "border-stone-600"
              }`}
            >
              {tFromContent(card.nameKey)}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={selectedRunCardId === null}
          onClick={() => {
            if (selectedRunCardId !== null) {
              dispatch({ type: "FEU_DE_CAMP_AMELIORER", runCardId: selectedRunCardId });
            }
          }}
          className="rounded-md bg-stone-700 px-4 py-2 text-sm disabled:opacity-30"
        >
          {t("ui.run.campfire.upgradeConfirm")}
        </button>
      </div>
    </div>
  );
}
