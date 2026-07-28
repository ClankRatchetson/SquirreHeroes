import { useEffect, useState } from "react";
import { t } from "./content/i18n/t";
import { loadSaveFile, type PersistedRunState } from "./persistence";
import { storageAdapter } from "./ui/persistence/storage";
import { useRunStore } from "./ui/store/run-store";
import { useMetaStore } from "./ui/store/meta-store";
import { MenuScreen } from "./ui/screens/MenuScreen";
import { CombatScreen } from "./ui/screens/CombatScreen";
import { RunScreen } from "./ui/screens/RunScreen";
import { HeroSelectScreen } from "./ui/screens/HeroSelectScreen";
import { CollectionScreen } from "./ui/screens/CollectionScreen";
import { SettingsScreen } from "./ui/screens/SettingsScreen";

type Screen = "loading" | "menu" | "hero-select" | "combat" | "run" | "collection" | "settings";

function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [savedRun, setSavedRun] = useState<PersistedRunState | null>(null);
  const hydrateRun = useRunStore((s) => s.hydrateRun);
  const setMeta = useMetaStore((s) => s.setMeta);

  useEffect(() => {
    let cancelled = false;
    void loadSaveFile(storageAdapter).then((saveFile) => {
      if (cancelled) {
        return;
      }
      setSavedRun(saveFile.currentRun);
      setMeta(saveFile.meta);
      setScreen("menu");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (screen === "loading") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-stone-900 text-stone-100">
        {t("ui.app.loading")}
      </main>
    );
  }

  const canResume = savedRun !== null && savedRun.outcome === "en_cours";

  switch (screen) {
    case "menu":
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
          onStartHeroSelect={() => {
            setScreen("hero-select");
          }}
          onOpenCollection={() => {
            setScreen("collection");
          }}
          onOpenSettings={() => {
            setScreen("settings");
          }}
        />
      );
    case "hero-select":
      return (
        <HeroSelectScreen
          onRunStarted={() => {
            setScreen("run");
          }}
          onBack={() => {
            setScreen("menu");
          }}
        />
      );
    case "collection":
      return (
        <CollectionScreen
          onBack={() => {
            setScreen("menu");
          }}
        />
      );
    case "settings":
      return (
        <SettingsScreen
          onBack={() => {
            setScreen("menu");
          }}
          onProgressionReset={() => {
            setSavedRun(null);
            setScreen("menu");
          }}
        />
      );
    case "combat":
      return <CombatScreen />;
    case "run":
      return (
        <RunScreen
          onRunEnded={() => {
            setScreen("hero-select");
          }}
        />
      );
  }
}

export default App;
