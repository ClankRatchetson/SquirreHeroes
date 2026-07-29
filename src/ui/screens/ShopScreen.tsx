import { t, tFromContent } from "../../content/i18n/t";
import { CARD_CATALOG } from "../../content/cards";
import { getDeckView } from "../../engine/run/selectors";
import { useRunStore } from "../store/run-store";

export function ShopScreen() {
  const runState = useRunStore((s) => s.runState);
  const dispatch = useRunStore((s) => s.dispatch);

  if (!runState?.pendingShop) {
    return null;
  }
  const { cardsForSale, upgradePrice, removePrice } = runState.pendingShop;
  const deckView = getDeckView(runState);

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-stone-900 p-4 text-stone-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("ui.run.shop.title")}</h2>
        <span data-testid="run-noisettes" className="text-amber-400">
          {t("ui.run.noisettesLabel")} {runState.noisettes}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {cardsForSale.flatMap((slot) => {
          const card = CARD_CATALOG[slot.cardId];
          if (!card) {
            return [];
          }
          const disabled = slot.purchased || runState.noisettes < slot.price;
          return [
            <button
              key={slot.cardId}
              type="button"
              data-testid={`shop-buy-${slot.cardId}`}
              disabled={disabled}
              onClick={() => {
                dispatch({ type: "ACHETER_CARTE", cardId: slot.cardId });
              }}
              className={`flex h-32 w-24 flex-col justify-between rounded-lg border-2 p-2 text-xs ${
                disabled ? "border-stone-700 opacity-40" : "border-amber-400"
              }`}
            >
              <span>{tFromContent(card.nameKey)}</span>
              <span>{slot.price}</span>
            </button>,
          ];
        })}
      </div>

      <div className="flex flex-col gap-2">
        {deckView.map(({ runCardId, card, upgraded }) => (
          <div key={runCardId} className="flex items-center justify-between gap-2 rounded-md bg-stone-800 p-2 text-xs">
            <span>
              {tFromContent(card.nameKey)}
              {upgraded ? "+" : ""}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                data-testid={`shop-upgrade-${runCardId}`}
                disabled={upgraded || !card.upgraded || runState.noisettes < upgradePrice}
                onClick={() => {
                  dispatch({ type: "ACHETER_AMELIORATION", runCardId });
                }}
                className="rounded bg-stone-700 px-2 py-1 disabled:opacity-30"
              >
                {t("ui.run.shop.upgrade")}
              </button>
              <button
                type="button"
                data-testid={`shop-remove-${runCardId}`}
                disabled={runState.noisettes < removePrice}
                onClick={() => {
                  dispatch({ type: "ACHETER_SUPPRESSION", runCardId });
                }}
                className="rounded bg-stone-700 px-2 py-1 disabled:opacity-30"
              >
                {t("ui.run.shop.remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="shop-leave"
        onClick={() => {
          dispatch({ type: "QUITTER_BOUTIQUE" });
        }}
        className="mt-auto rounded-md bg-amber-600 px-4 py-3 font-semibold text-stone-950"
      >
        {t("ui.run.shop.leave")}
      </button>
    </div>
  );
}
