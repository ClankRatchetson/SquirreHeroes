import { useMemo } from "react";
import { CombatControllerContext, type CombatController } from "../combat-controller";
import { useRunStore } from "../store/run-store";
import { useMetaStore } from "../store/meta-store";
import { CombatBattlefield } from "../components/combat/CombatBattlefield";
import { TutorialOverlay } from "../components/feedback/TutorialOverlay";
import { CASSE_NOIX, HERO_CATALOG } from "../../content/heroes";

/**
 * Écran de combat en mode run : `Provider` fin autour de `useRunStore`.
 * `onReplay` n'est jamais invoqué en pratique — dès que le combat se
 * termine, `runState.pendingCombat` repasse à `null` et `RunScreen` change
 * de phase avant qu'un nouveau rendu n'ait l'occasion d'afficher l'overlay.
 */
export function RunCombatScreen() {
  const engineState = useRunStore((s) => s.runState?.pendingCombat ?? null);
  const heroId = useRunStore((s) => s.runState?.heroId);
  const targeting = useRunStore((s) => s.targeting);
  const isResolvingEnemyTurn = useRunStore((s) => s.isResolvingEnemyTurn);
  const pendingEvents = useRunStore((s) => s.pendingEvents);
  const selectCard = useRunStore((s) => s.selectCard);
  const hoverEnemy = useRunStore((s) => s.hoverEnemy);
  const playCard = useRunStore((s) => s.playCard);
  const endTurn = useRunStore((s) => s.endTurn);
  const consumeEvent = useRunStore((s) => s.consumeEvent);
  const tutorialCompleted = useMetaStore((s) => s.meta.tutorialCompleted);
  const completeTutorial = useMetaStore((s) => s.completeTutorial);

  const controller = useMemo<CombatController>(
    () => ({
      engineState,
      heroNameKey: (heroId ? HERO_CATALOG[heroId]?.nameKey : undefined) ?? CASSE_NOIX.nameKey,
      targeting,
      isResolvingEnemyTurn,
      pendingEvents,
      selectCard,
      hoverEnemy,
      playCard,
      endTurn,
      consumeEvent,
    }),
    [engineState, heroId, targeting, isResolvingEnemyTurn, pendingEvents, selectCard, hoverEnemy, playCard, endTurn, consumeEvent],
  );

  return (
    <CombatControllerContext.Provider value={controller}>
      <CombatBattlefield onReplay={() => {}} />
      {!tutorialCompleted && <TutorialOverlay onFinish={completeTutorial} />}
    </CombatControllerContext.Provider>
  );
}
