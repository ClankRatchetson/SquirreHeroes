import { t, tFromContent } from "../../content/i18n/t";
import { META_TREE } from "../../content/meta-tree";
import { isNodePurchasable } from "../../engine/meta";
import { useMetaStore } from "../store/meta-store";

export interface CollectionScreenProps {
  readonly onBack: () => void;
}

/** Nombre de runs démarrées à partir duquel le jalon "jouer plusieurs runs" est considéré atteint — valeur d'affichage uniquement, aucune conséquence de jeu. */
const RUNS_MILESTONE_THRESHOLD = 5;

export function CollectionScreen({ onBack }: CollectionScreenProps) {
  const meta = useMetaStore((s) => s.meta);
  const purchaseNode = useMetaStore((s) => s.purchaseNode);

  const runsMilestoneReached = meta.totalRunsStarted >= RUNS_MILESTONE_THRESHOLD;
  const bossMilestoneReached = meta.bossesDefeated.length > 0;

  return (
    <main className="flex min-h-dvh flex-col gap-4 bg-stone-900 p-4 text-stone-100">
      <h2 className="text-xl font-bold">{t("ui.collection.title")}</h2>
      <span data-testid="collection-glands-dor" className="text-lg text-amber-400">
        {t("ui.collection.glandsDorLabel")} : {meta.glandsDor}
      </span>

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{t("ui.collection.milestones.title")}</h3>
        <div className={`rounded-md p-2 ${meta.actICompleted ? "bg-emerald-900" : "bg-stone-800 opacity-60"}`}>
          <span>{t("ui.collection.milestones.actI")}</span>
          {!meta.actICompleted && <p className="text-xs text-stone-400">{t("ui.collection.milestones.actIPending")}</p>}
        </div>
        <div className={`rounded-md p-2 ${bossMilestoneReached ? "bg-emerald-900" : "bg-stone-800 opacity-60"}`}>
          <span>{t("ui.collection.milestones.boss")}</span>
          {!bossMilestoneReached && <p className="text-xs text-stone-400">{t("ui.collection.milestones.bossPending")}</p>}
        </div>
        <div className={`rounded-md p-2 ${runsMilestoneReached ? "bg-emerald-900" : "bg-stone-800 opacity-60"}`}>
          <span>{t("ui.collection.milestones.runs")}</span>
          {!runsMilestoneReached && <p className="text-xs text-stone-400">{t("ui.collection.milestones.runsPending")}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{t("ui.collection.tree.title")}</h3>
        {META_TREE.map((node) => {
          const unlocked = meta.unlockedTreeNodeIds.includes(node.id);
          const purchasable = !unlocked && isNodePurchasable(meta, META_TREE, node.id);
          return (
            <div key={node.id} className="flex items-center justify-between gap-2 rounded-md bg-stone-800 p-2">
              <div className="flex flex-col">
                <span className="font-semibold">{tFromContent(node.nameKey)}</span>
                <span className="text-xs text-stone-400">{tFromContent(node.descriptionKey)}</span>
              </div>
              {unlocked ? (
                <span className="text-emerald-400">✓</span>
              ) : (
                <button
                  type="button"
                  data-testid={`tree-node-buy-${node.id}`}
                  disabled={!purchasable}
                  onClick={() => {
                    purchaseNode(node.id);
                  }}
                  className="rounded bg-amber-600 px-3 py-2 text-sm font-semibold text-stone-950 disabled:opacity-30"
                >
                  {t("ui.collection.tree.buy")} ({node.cost})
                </button>
              )}
            </div>
          );
        })}
      </section>

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
