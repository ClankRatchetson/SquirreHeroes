import { useEffect, useState } from "react";
import { t } from "./content/i18n/t";
import { loadSaveFile, type PersistedRunState } from "./persistence";
import { storageAdapter } from "./ui/persistence/storage";
import { useRunStore } from "./ui/store/run-store";
import { MenuScreen } from "./ui/screens/MenuScreen";
import { CombatScreen } from "./ui/screens/CombatScreen";
import { RunScreen } from "./ui/screens/RunScreen";

type Screen = "loading" | "menu" | "combat" | "run";

function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [savedRun, setSavedRun] = useState<PersistedRunState | null>(null);
  const hydrateRun = useRunStore((s) => s.hydrateRun);

  useEffect(() => {
    let cancelled = false;
    void loadSaveFile(storageAdapter).then((saveFile) => {
      if (cancelled) {
        return;
      }
      setSavedRun(saveFile.currentRun);
      setScreen("menu");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (screen === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-stone-900 text-stone-100">
        {t("ui.app.loading")}
      </main>
    );
  }

  const canResume = savedRun !== null && savedRun.outcome === "en_cours";

  if (screen === "menu") {
    return (
      <MenuScreen
        canResume={canResume}
        onResumeRun={() => {
          if (savedRun) {
            hydrateRun(savedRun);
            setScreen("run");
          }
        }}
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
