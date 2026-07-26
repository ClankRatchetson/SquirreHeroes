import { test, expect } from "@playwright/test";

test("un combat est jouable au tap sur mobile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouveau combat" }).click();

  await expect(page.getByTestId("hero-panel")).toBeVisible();
  await expect(page.getByTestId("turn-number")).toContainText("Tour 1");
  await expect(page.getByTestId("card-in-hand")).toHaveCount(5);

  // Carte jouable ne nécessitant pas de cible (garanti présente dans la main
  // de départ : sur 10 cartes du deck, seules 4 ciblent un ennemi).
  const simpleCard = page
    .locator('[data-testid="card-in-hand"][data-playable="true"][data-needs-target="false"]')
    .first();
  await expect(simpleCard).toBeVisible();
  await simpleCard.click();

  // La carte jouée quitte la main.
  await expect(page.getByTestId("card-in-hand")).toHaveCount(4);

  await page.getByTestId("end-turn-button").click();

  // Le tour ennemi se résout et le tour héros suivant démarre.
  await expect(page.getByTestId("turn-number")).not.toContainText("Tour 1");
});
