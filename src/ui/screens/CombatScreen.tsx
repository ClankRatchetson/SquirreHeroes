import { getEnergy } from "../../engine/core";
import { t } from "../../content/i18n/t";
import { CASSE_NOIX } from "../../content/heroes";
import { useCombatStore } from "../store/combat-store";
import { HeroPanel } from "../components/hero/HeroPanel";
import { EnemyRow } from "../components/enemy/EnemyRow";
import { Hand } from "../components/hand/Hand";
import { EnergyBar } from "../components/hand/EnergyBar";
import { EndTurnButton } from "../components/hand/EndTurnButton";
import { OutcomeOverlay } from "../components/feedback/OutcomeOverlay";

export function CombatScreen() {
  const engineState = useCombatStore((s) => s.engineState);
  const isResolvingEnemyTurn = useCombatStore((s) => s.isResolvingEnemyTurn);
  const endTurn = useCombatStore((s) => s.endTurn);
  const startNewCombat = useCombatStore((s) => s.startNewCombat);

  if (!engineState) {
    return null;
  }

  const energy = getEnergy(engineState);

  return (
    <div className="flex min-h-dvh flex-col gap-3 bg-stone-900 p-3 text-stone-100">
      <p data-testid="turn-number" className="text-center text-xs text-stone-400">
        {t("ui.combat.turnLabel")} {engineState.turnNumber}
        {isResolvingEnemyTurn && <span className="ml-2">{t("ui.combat.enemyTurnResolving")}</span>}
      </p>

      <EnemyRow enemies={engineState.enemies} />

      <div className="flex-1" />

      <HeroPanel hero={engineState.hero} nameKey={CASSE_NOIX.nameKey} />

      <div className="flex items-center justify-between">
        <EnergyBar current={energy.current} max={energy.max} />
        <EndTurnButton disabled={isResolvingEnemyTurn} onClick={endTurn} />
      </div>

      <Hand state={engineState} />

      {engineState.outcome !== "en_cours" && (
        <OutcomeOverlay
          outcome={engineState.outcome}
          onReplay={() => {
            startNewCombat(Date.now());
          }}
        />
      )}
    </div>
  );
}
