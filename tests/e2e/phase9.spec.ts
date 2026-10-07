import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

const today = new Date().toISOString().slice(0, 10);
const demoOpp = {
  id: "flyer-test",
  title: "Robotics Saturday Camp",
  organization: "Valley STEM Center",
  description: "Build and code a robot with other students. Snacks provided.",
  category: "camp",
  cost: { type: "free" },
  grades: { min: 6, max: 12 },
  dateText: "Saturdays in November",
  mode: "in_person",
  city: "Edinburg",
  carFree: "unknown",
  sourceUrl: "https://example.org/robotics-camp",
  source: "demo",
};

test("progress shows badges and the monthly challenge; avatar unlocks by level", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { extra: { xp: 130, volunteer: [{ id: "v1", date: today, org: "Food bank", hours: 12 }] } });
  await page.goto("/me/progress");
  await waitForApp(page);
  await expect(page.getByText("This month's challenge")).toBeVisible();
  await expect(page.getByText("Volunteer 10", { exact: true })).toBeVisible();
  await expect(page.getByText(/2 of 20 earned/)).toBeVisible();
  await page.screenshot({ path: `.screenshots/${info.project.name}-badges.png`, fullPage: true });

  await page.goto("/me/avatar");
  await waitForApp(page);
  await expect(page.getByText("You're level 3")).toBeVisible();
  await page.getByRole("radio", { name: "Star eyes" }).click();
  await expect(page.getByRole("radio", { name: "Star eyes" })).toHaveAttribute("aria-checked", "true");
  // Crown needs level 8 — can't be picked.
  const crown = page.getByRole("radio", { name: /Crown — Unlocks at level 8/ });
  await expect(crown).toHaveAttribute("aria-disabled", "true");
  await crown.dispatchEvent("click"); // tap the locked item itself (a forced tap can land on the tab bar on phones)
  await expect(crown).toHaveAttribute("aria-checked", "false");
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("year in review counts this school year", async ({ page }) => {
  await asStudent(page, {
    extra: {
      volunteer: [{ id: "v1", date: today, org: "Food bank", hours: 6 }],
      accomplishments: [{ id: "a1", title: "UIL Number Sense — 2nd place", kind: "award", date: today }],
      xpLog: [{ reason: "apply", xp: 25, at: new Date().toISOString() }],
      xp: 25,
    },
  });
  await page.goto("/me/year");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: "What a year, Tester!" })).toBeVisible();
  await expect(page.getByText("UIL Number Sense — 2nd place")).toBeVisible();
  await expect(page.getByText(/Your busiest volunteer month/)).toBeVisible();
  await expectAccessible(page);
});

test("leaderboard shows school totals only", async ({ page }) => {
  await asStudent(page);
  await page.goto("/me/leaderboard");
  await waitForApp(page);
  await expect(page.getByText("Demo Early College High School")).toBeVisible();
  await expect(page.getByText("Demo High School", { exact: true })).toBeVisible();
  await expect(page.getByText(/Demo schools are sample data/)).toBeVisible();
  const json = await (await page.request.get("/api/school/leaderboard")).json();
  for (const s of json.schools) expect(Object.keys(s).sort()).toEqual(["city", "demo", "hours", "name", "yours"]);
  await expectAccessible(page);
});

test("marking an acceptance shows the celebration screen", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { extra: { saved: [{ id: "flyer-test", opp: demoOpp, status: "applied", savedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } });
  await page.goto("/me/saved");
  await waitForApp(page);
  await page.getByRole("combobox").first().selectOption("accepted");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "You got in!" })).toBeVisible();
  await expect(dialog.getByText("Robotics Saturday Camp")).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-celebrate.png` });
  await dialog.getByRole("button", { name: "Yay! Close" }).click();
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);
});

test("printable bilingual flyer with QR code", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { extra: { saved: [{ id: "flyer-test", opp: demoOpp, status: "saved", savedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } });
  await page.goto("/flyer?id=flyer-test");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: "Robotics Saturday Camp" })).toBeVisible();
  await expect(page.getByText("Scan for details")).toBeVisible();
  await expect(page.getByText("Escanea para más detalles")).toBeVisible();
  await expect(page.locator("article svg")).toHaveCount(1);
  await expectAccessible(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Print flyer" })).toBeHidden();
  await page.screenshot({ path: `.screenshots/${info.project.name}-flyer-print.png`, fullPage: true });
  expect(errors).toEqual([]);
});
