import { getNodeStatus } from "../../engine/run/selectors";
import type { RunNode, RunNodeType } from "../../engine/types";
import { t, tFromContent } from "../../content/i18n/t";
import { useRunStore } from "../store/run-store";

const NODE_TYPE_LABEL_KEY = {
  combat: "ui.run.map.combat",
  elite: "ui.run.map.elite",
  boutique: "ui.run.map.boutique",
  feu_de_camp: "ui.run.map.feu_de_camp",
  evenement: "ui.run.map.evenement",
  boss: "ui.run.map.boss",
} as const satisfies Record<RunNodeType, string>;

/** `actId` -> clé i18n d'étiquette de biome — sans elle, rien ne signale visuellement une transition d'acte. */
const ACT_LABEL_KEY: Readonly<Record<string, string>> = {
  acte_1: "ui.run.acts.acte_1.label",
  acte_2: "ui.run.acts.acte_2.label",
  acte_3: "ui.run.acts.acte_3.label",
};

function groupByFloor(nodes: readonly RunNode[]): ReadonlyArray<readonly [number, readonly RunNode[]]> {
  const byFloor = new Map<number, RunNode[]>();
  for (const node of nodes) {
    const list = byFloor.get(node.floor) ?? [];
    list.push(node);
    byFloor.set(node.floor, list);
  }
  return [...byFloor.entries()].sort(([a], [b]) => a - b);
}

export function RunMapScreen() {
  const runState = useRunStore((s) => s.runState);
  const dispatch = useRunStore((s) => s.dispatch);

  if (!runState) {
    return null;
  }

  const floors = groupByFloor(runState.map.nodes);
  const actLabelKey = ACT_LABEL_KEY[runState.map.actId];

  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-stone-900 p-3 text-stone-100">
      {actLabelKey && (
        <p data-testid="run-act-label" className="text-center text-sm font-semibold text-amber-300">
          {tFromContent(actLabelKey)}
        </p>
      )}
      <div className="flex items-center justify-between text-sm">
        <span data-testid="run-hero-hp">
          {t("ui.combat.hpLabel")} {runState.heroHp}/{runState.heroMaxHp}
        </span>
        <span data-testid="run-noisettes" className="text-amber-400">
          {t("ui.run.noisettesLabel")} {runState.noisettes}
        </span>
        <span data-testid="run-deck-size">{runState.deck.length}</span>
      </div>

      <div className="flex flex-1 justify-start gap-3 overflow-x-auto py-2">
        {floors.map(([floor, nodes]) => (
          <div key={floor} className="flex flex-col items-center gap-2">
            <p className="text-xs text-stone-400">
              {t("ui.run.map.floorLabel")} {floor}
            </p>
            {nodes.map((node) => {
              const status = getNodeStatus(runState, node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  data-testid="run-node"
                  data-status={status}
                  disabled={status !== "disponible"}
                  onClick={() => {
                    dispatch({ type: "CHOISIR_NOEUD", nodeId: node.id });
                  }}
                  className={`w-20 rounded-md border-2 px-2 py-3 text-xs font-semibold ${
                    status === "disponible"
                      ? "border-amber-400 bg-stone-800"
                      : status === "visite"
                        ? "border-stone-600 bg-stone-800 opacity-60"
                        : "border-stone-700 bg-stone-900 opacity-30"
                  }`}
                >
                  {t(NODE_TYPE_LABEL_KEY[node.type])}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
