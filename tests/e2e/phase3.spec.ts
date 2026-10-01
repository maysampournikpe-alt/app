import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

test("interest quiz suggests careers", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/explore/quiz");
  await waitForApp(page);
  const groups = page.locator("fieldset");
  const n = await groups.count();
  for (let i = 0; i < n; i++) {
    // Love the "helping" (S) questions, OK on the rest.
    const label = i % 6 === 3 ? "Love it" : "It's OK";
    await groups.nth(i).getByText(label, { exact: true }).click();
  }
  await page.getByRole("button", { name: "See my results" }).click();
  await expect(page.getByText("Helper (Social)")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Careers to explore" })).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-quiz.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("career explorer shows details and links to Texas pay + video", async ({ page }) => {
  await asStudent(page);
  await page.goto("/explore/careers");
  await waitForApp(page);
  await page.getByRole("button", { name: /Registered Nurse/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("A typical day")).toBeVisible();
  await expect(dialog.getByRole("link", { name: /Texas pay/ })).toHaveAttribute("href", /careeronestop\.org.*Registered%20Nurses.*TX/);
  await expectAccessible(page);
});

test("colleges filter to the Valley", async ({ page }) => {
  await asStudent(page);
  await page.goto("/explore/colleges");
  await waitForApp(page);
  await page.getByRole("switch", { name: "Rio Grande Valley only" }).click();
  await expect(page.getByRole("heading", { name: /UTRGV/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /University of Texas at Austin/ })).toHaveCount(0);
});

test("find: surprise me, map view, reviews, similar, save search", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: "Good for this time of year" })).toBeVisible();
  await page.getByRole("button", { name: "Surprise me" }).click();
  await expect(page.getByText(/Surprise! Have you thought about this\?/)).toBeVisible();

  await page.getByLabel("What are you looking for?").fill("volunteer hours");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("main article").first()).toBeVisible();
  await page.getByRole("button", { name: "Save this search" }).click();
  await expect(page.getByText(/Search saved/)).toBeVisible();

  await page.getByRole("radio", { name: "Map" }).click();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await page.screenshot({ path: `.screenshots/${info.project.name}-map.png` });
  await page.getByRole("radio", { name: "List" }).click();

  const card = page.locator("main article", { hasText: "Food Bank" }).first();
  await card.getByRole("button", { name: /^Details/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Getting there")).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Similar opportunities" })).toBeVisible();
  await dialog.getByRole("button", { name: "I went — leave a tip" }).click();
  await dialog.getByLabel("Short tip for other students").fill("Wear closed-toe shoes. Call me at 956-555-1234");
  await dialog.getByRole("button", { name: "Post tip" }).click();
  await expect(dialog.getByText(/We removed personal info/)).toBeVisible();
  await expect(dialog.getByText("Wear closed-toe shoes.", { exact: false })).toBeVisible();
  await expect(dialog.getByText("956-555-1234")).toHaveCount(0);
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("trending near you appears after students save", async ({ page }) => {
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await page.getByLabel("What are you looking for?").fill("coding competitions");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.locator("main article").first().getByRole("button", { name: /^Save/ }).click();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Trending near you" })).toBeVisible();
});
