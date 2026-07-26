import { test, expect } from "@playwright/test";

test("l'écran d'accueil affiche le titre du jeu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Squirrel Heroes" })).toBeVisible();
  await expect(page.getByText("Les Justiciers de la Forêt")).toBeVisible();
});
