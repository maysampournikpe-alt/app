import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

// Every page in the app. Each one is opened at phone and desktop size, in
// light and dark mode, and checked for errors and accessibility problems.
export const ROUTES = ["/", "/coach", "/coach/practice", "/coach/daily", "/coach/flashcards", "/coach/tests", "/coach/speaking", "/coach/courses", "/plan", "/people", "/me", "/me/profile", "/me/saved", "/me/settings", "/me/data", "/me/parental", "/me/tracker", "/me/progress", "/me/resume", "/plan/calendar", "/plan/schedule", "/plan/budget", "/plan/packing", "/plan/wellbeing", "/people/group?slug=study-algebra", "/people/plan?code=ZZZZZZ", "/staff", "/explore", "/explore/careers", "/explore/quiz", "/explore/colleges", "/explore/dual", "/explore/scholarships", "/explore/fafsa", "/explore/trades", "/explore/military", "/explore/transport", "/explore/money", "/privacy", "/help", "/how-ai-works", "/offline"];

for (const route of ROUTES) {
  for (const theme of ["light", "dark"] as const) {
    test(`${route} (${theme}) loads with no errors and passes accessibility checks`, async ({ page }, info) => {
      const errors = trackErrors(page);
      await asStudent(page, { theme });
      await page.goto(route);
      await waitForApp(page);
      await expectAccessible(page);
      // No sideways scrolling on phones
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(1);
      await page.screenshot({ path: `.screenshots/${info.project.name}-${theme}${route.replace(/\//g, "_") || "_home"}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}

test("Spanish toggle translates the page", async ({ page }) => {
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await page.getByRole("button", { name: "Español" }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
