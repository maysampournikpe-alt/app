import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

test("search, see results and suggestions, filter, and save", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: /What are you looking for today\?/ })).toBeVisible();
  await page.getByLabel("What are you looking for?").fill("law internships for high schoolers");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Results for/ })).toBeVisible();
  // Demo notice is shown when there's no API key
  await expect(page.getByText(/Demo mode/)).toBeVisible();
  // Suggestions with scripts
  await expect(page.getByRole("heading", { name: "Places that might offer this" })).toBeVisible();
  await expect(page.getByText("Not a confirmed listing. Contact them first to ask.").first()).toBeVisible();
  await page.getByText("Sample email").first().click();
  await expect(page.getByText(/\[your first name\]/).first()).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-finder-law.png`, fullPage: true });

  // A search with real results
  await page.getByLabel("What are you looking for?").fill("free coding camps");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const cards = page.locator("main article");
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  // Free only filter
  await page.getByRole("button", { name: /Free only/ }).click();
  await expect(page.getByRole("button", { name: /Free only/ })).toHaveAttribute("aria-pressed", "true");
  expect(await cards.count()).toBeLessThanOrEqual(before);
  // Save the first one
  const firstSave = cards.first().getByRole("button", { name: /^Save/ });
  await firstSave.click();
  await expect(cards.first().getByRole("button", { name: /^Saved/ })).toHaveAttribute("aria-pressed", "true");
  // Details panel shows "Not listed" for unknown info
  await cards.first().getByRole("button", { name: /^Details/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-finder-details.png` });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(errors).toEqual([]);
});

test("scam example shows a warning", async ({ page }, info) => {
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await page.getByLabel("What are you looking for?").fill("jobs from home");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const scamCard = page.locator("article", { hasText: "Spot the scam" });
  await expect(scamCard).toBeVisible();
  await expect(scamCard.getByText(/Be careful — warning signs/)).toBeVisible();
  await page.screenshot({ path: `.screenshots/${info.project.name}-finder-jobs.png`, fullPage: true });
});

test("crisis messages show help lines instead of results", async ({ page }) => {
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await page.getByLabel("What are you looking for?").fill("i want to die");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "988" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Call 988/ })).toBeVisible();
});

test("Spanish search returns Spanish results", async ({ page }) => {
  await asStudent(page, { locale: "es" });
  await page.goto("/");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: /¿Qué estás buscando hoy\?/ })).toBeVisible();
  await page.getByLabel("¿Qué estás buscando?").fill("becas para la universidad");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Resultados para/ })).toBeVisible();
  await expect(page.getByText("Por qué te queda").first()).toBeVisible();
});
