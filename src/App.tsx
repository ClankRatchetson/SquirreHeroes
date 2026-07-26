import { useState } from "react";
import { MenuScreen } from "./ui/screens/MenuScreen";
import { CombatScreen } from "./ui/screens/CombatScreen";

type Screen = "menu" | "combat";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  if (screen === "menu") {
    return (
      <MenuScreen
        onStart={() => {
          setScreen("combat");
        }}
      />
    );
  }
  return <CombatScreen />;
}

export default App;
