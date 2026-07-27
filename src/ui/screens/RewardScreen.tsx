import { t } from "../../content/i18n/t";
import { CARD_CATALOG } from "../../content/cards";
import { useRunStore } from "../store/run-store";
import { RewardCardChoice } from "../components/reward/RewardCardChoice";

export function RewardScreen() {
  const runState = useRunStore((s) => s.runState);
  const dispatch = useRunStore((s) => s.dispatch);

  if (!runState?.pendingReward) {
    return null;
  }
  const { cardChoices, noisettes } = runState.pendingReward;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-2xl font-bold">{t("ui.run.reward.title")}</h2>
      <p className="text-amber-400">
        {t("ui.run.reward.noisettesGained")} {noisettes}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {cardChoices.flatMap((cardId) => {
          const card = CARD_CATALOG[cardId];
          return card
            ? [
                <RewardCardChoice
                  key={cardId}
                  card={card}
                  onChoose={() => {
                    dispatch({ type: "CHOISIR_RECOMPENSE_CARTE", cardId });
                  }}
                />,
              ]
            : [];
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "PASSER_RECOMPENSE" });
        }}
        className="rounded-md bg-stone-700 px-4 py-2 text-sm"
      >
        {t("ui.run.reward.skip")}
      </button>
    </div>
  );
}
