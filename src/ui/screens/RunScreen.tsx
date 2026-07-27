import { useRunStore } from "../store/run-store";
import { RunMapScreen } from "./RunMapScreen";
import { RunCombatScreen } from "./RunCombatScreen";
import { RewardScreen } from "./RewardScreen";
import { ShopScreen } from "./ShopScreen";
import { CampfireScreen } from "./CampfireScreen";
import { EventScreen } from "./EventScreen";
import { RunOutcomeOverlay } from "../components/feedback/RunOutcomeOverlay";

export interface RunScreenProps {
  /** Fin de run (victoire/défaite) : retour à la sélection de héros pour qu'une nouvelle run recalcule ses bonus. */
  readonly onRunEnded: () => void;
}

/** Switch pur sur `runState.phase` — mapping 1:1 avec la machine à états du moteur, pas de librairie de routing. */
export function RunScreen({ onRunEnded }: RunScreenProps) {
  const phase = useRunStore((s) => s.runState?.phase);

  if (!phase) {
    return null;
  }

  switch (phase) {
    case "carte":
      return <RunMapScreen />;
    case "combat":
      return <RunCombatScreen />;
    case "recompense":
      return <RewardScreen />;
    case "boutique":
      return <ShopScreen />;
    case "feu_de_camp":
      return <CampfireScreen />;
    case "evenement":
      return <EventScreen />;
    case "run_over":
      return <RunOutcomeOverlay onNewRun={onRunEnded} />;
  }
}
