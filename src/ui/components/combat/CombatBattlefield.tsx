import { getEnergy } from "../../../engine/core";
import { t } from "../../../content/i18n/t";
import { CASSE_NOIX } from "../../../content/heroes";
import { useCombatController } from "../../combat-controller";
import { HeroPanel } from "../hero/HeroPanel";
import { EnemyRow } from "../enemy/EnemyRow";
import { Hand } from "../hand/Hand";
import { EnergyBar } from "../hand/EnergyBar";
import { EndTurnButton } from "../hand/EndTurnButton";
import { OutcomeOverlay } from "../feedback/OutcomeOverlay";

export interface CombatBattlefieldProps {
  readonly onReplay: () => void;
}

/**
 * Composition de combat de la Phase 2, extraite telle quelle de
 * `CombatScreen.tsx` : ne lit plus `useCombatStore` directement mais
 * `useCombatController()`, ce qui la rend réutilisable à l'identique par le
 * mode démo (`CombatScreen`) et par le mode run (`RunCombatScreen`).
 */
export function CombatBattlefield({ onReplay }: CombatBattlefieldProps) {
  const { engineState, isResolvingEnemyTurn, endTurn } = useCombatController();

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

      {engineState.outcome !== "en_cours" && <OutcomeOverlay outcome={engineState.outcome} onReplay={onReplay} />}
    </div>
  );
}
