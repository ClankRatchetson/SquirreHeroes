import type { MetaProgression } from "../../engine/meta";
import type { RunState } from "../../engine/types";

export interface MetaStoreState {
  readonly meta: MetaProgression;

  /** Hydratation au boot depuis le `SaveFile` chargé — ne persiste pas (donnée déjà celle en base). */
  readonly setMeta: (meta: MetaProgression) => void;
  /** Tente d'acheter un nœud de l'arbre de Glands d'Or ; no-op silencieux si invalide. */
  readonly purchaseNode: (nodeId: string) => void;
  /** Incrémente `totalRunsStarted` — appelé par `useRunStore.startNewRun`. */
  readonly recordRunStart: () => void;
  /** Applique les conséquences de fin de run (jalons, Glands d'Or) — appelé à la transition vers `run_over`. */
  readonly recordRunCompletion: (finishedRun: RunState) => void;
  /** Marque le tutoriel de premier combat comme vu (terminé OU passé) — ne se réaffiche plus jamais après. */
  readonly completeTutorial: () => void;
}
