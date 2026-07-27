import { tFromContent } from "../../content/i18n/t";
import { useRunStore } from "../store/run-store";

export function EventScreen() {
  const runState = useRunStore((s) => s.runState);
  const dispatch = useRunStore((s) => s.dispatch);

  if (!runState?.pendingEventId) {
    return null;
  }
  const event = runState.eventCatalog[runState.pendingEventId];
  if (!event) {
    return null;
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 p-6 text-center text-stone-100">
      <h2 className="text-2xl font-bold">{tFromContent(event.titleKey)}</h2>
      <p className="text-sm text-stone-300">{tFromContent(event.textKey)}</p>
      <div className="flex flex-col gap-2">
        {event.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => {
              dispatch({ type: "CHOISIR_EVENEMENT_OPTION", choiceId: choice.id });
            }}
            className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-stone-950"
          >
            {tFromContent(choice.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
