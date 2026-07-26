import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Certains environnements (sandbox CI maison) pré-installent Chromium à un
// chemin fixe plutôt que via `playwright install`. On ne l'utilise que s'il
// existe, pour ne jamais casser une installation standard sur poste de dev.
const sandboxChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
