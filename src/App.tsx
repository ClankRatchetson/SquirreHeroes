import { t } from "./content/i18n/t";

function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-stone-100">
      <h1 className="text-3xl font-bold">{t("app.title")}</h1>
      <p className="text-lg text-amber-400">{t("app.subtitle")}</p>
      <p className="text-sm text-stone-400">{t("app.tagline")}</p>
    </main>
  );
}

export default App;
