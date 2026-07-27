import { useState } from "react";
import { MenuScreen } from "./ui/screens/MenuScreen";
import { CombatScreen } from "./ui/screens/CombatScreen";
import { RunScreen } from "./ui/screens/RunScreen";

type Screen = "menu" | "combat" | "run";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  if (screen === "menu") {
    return (
      <MenuScreen
        onStartCombat={() => {
          setScreen("combat");
        }}
        onStartRun={() => {
          setScreen("run");
        }}
      />
    );
  }
  if (screen === "combat") {
    return <CombatScreen />;
  }
  return <RunScreen />;
}

export default App;
