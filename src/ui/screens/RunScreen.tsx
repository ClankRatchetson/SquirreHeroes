import { useRunStore } from "../store/run-store";
import { RunMapScreen } from "./RunMapScreen";
import { RunCombatScreen } from "./RunCombatScreen";
import { RewardScreen } from "./RewardScreen";
import { ShopScreen } from "./ShopScreen";
import { CampfireScreen } from "./CampfireScreen";
import { EventScreen } from "./EventScreen";
import { RunOutcomeOverlay } from "../components/feedback/RunOutcomeOverlay";

/** Switch pur sur `runState.phase` — mapping 1:1 avec la machine à états du moteur, pas de librairie de routing. */
export function RunScreen() {
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
      return <RunOutcomeOverlay />;
  }
}
