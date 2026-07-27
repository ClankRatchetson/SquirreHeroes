import { useMemo } from "react";
import { CombatControllerContext, type CombatController } from "../combat-controller";
import { useCombatStore } from "../store/combat-store";
import { CombatBattlefield } from "../components/combat/CombatBattlefield";
import { CASSE_NOIX } from "../../content/heroes";

/** Écran de démo Phase 2 : `Provider` fin autour de `useCombatStore`. */
export function CombatScreen() {
  const engineState = useCombatStore((s) => s.engineState);
  const targeting = useCombatStore((s) => s.targeting);
  const isResolvingEnemyTurn = useCombatStore((s) => s.isResolvingEnemyTurn);
  const pendingEvents = useCombatStore((s) => s.pendingEvents);
  const selectCard = useCombatStore((s) => s.selectCard);
  const hoverEnemy = useCombatStore((s) => s.hoverEnemy);
  const playCard = useCombatStore((s) => s.playCard);
  const endTurn = useCombatStore((s) => s.endTurn);
  const consumeEvent = useCombatStore((s) => s.consumeEvent);
  const startNewCombat = useCombatStore((s) => s.startNewCombat);

  const controller = useMemo<CombatController>(
    () => ({
      engineState,
      heroNameKey: CASSE_NOIX.nameKey,
      targeting,
      isResolvingEnemyTurn,
      pendingEvents,
      selectCard,
      hoverEnemy,
      playCard,
      endTurn,
      consumeEvent,
    }),
    [engineState, targeting, isResolvingEnemyTurn, pendingEvents, selectCard, hoverEnemy, playCard, endTurn, consumeEvent],
  );

  return (
    <CombatControllerContext.Provider value={controller}>
      <CombatBattlefield
        onReplay={() => {
          startNewCombat(Date.now());
        }}
      />
    </CombatControllerContext.Provider>
  );
}
