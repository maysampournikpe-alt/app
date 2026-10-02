import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

test("weekly schedule → balance meter → burnout check", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/plan/schedule");
  await waitForApp(page);
  await page.getByRole("button", { name: "Start with a typical school week" }).click();
  // Add practice and a job every weekday → overloaded week
  for (const [label, kind, start, end] of [
    ["Soccer practice", "practice", "15:45", "18:30"],
    ["Job", "work", "18:45", "22:30"],
  ] as const) {
    await page.getByLabel("What is it?").fill(label);
    await page.getByLabel("Type", { exact: true }).selectOption(kind);
    for (const d of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      const chip = page.getByRole("button", { name: d, exact: true });
      const want = d !== "Sat" && d !== "Sun";
      if ((await chip.getAttribute("aria-pressed")) !== String(want)) await chip.click();
    }
    await page.getByLabel("Starts").fill(start);
    await page.getByLabel("Ends").fill(end);
    await page.getByRole("button", { name: "Add to my week" }).click();
  }
  await page.getByRole("radio", { name: "Wed" }).click();
  await expect(page.getByText("Soccer practice")).toBeVisible();
  await expect(page.getByText(/Your schedule looks overloaded/)).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-schedule.png`, fullPage: true });

  await page.getByRole("link", { name: /Your schedule looks overloaded/ }).click();
  await expect(page.getByText(/Your week looks really full/)).toBeVisible();
  await page.getByRole("button", { name: /Stressed/ }).click();
  await expect(page.getByText(/Stress happens to everyone/)).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText(/Breathe in/)).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-wellbeing.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("budget: earn, spend, save toward a goal", async ({ page }) => {
  await asStudent(page);
  await page.goto("/plan/budget");
  await waitForApp(page);
  await page.getByLabel("What are you saving for?").fill("Laptop");
  await page.getByLabel("Goal amount ($)").fill("400");
  await page.getByRole("button", { name: "Add a goal" }).click();
  await page.getByLabel("Amount ($)", { exact: true }).fill("120");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByLabel("Type").selectOption("save");
  await page.getByLabel("Savings goal").selectOption({ label: "Laptop" });
  await page.getByLabel("Amount ($)", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("$40.00 of $400.00")).toBeVisible();
  await expect(page.locator("li", { hasText: "Left to use" })).toContainText("$80.00");
  await expectAccessible(page);
});

test("packing list from a template", async ({ page }) => {
  await asStudent(page);
  await page.goto("/plan/packing");
  await waitForApp(page);
  await page.getByRole("button", { name: /Overnight camp/ }).click();
  await page.getByRole("checkbox", { name: "Pajamas" }).click();
  await expect(page.getByText(/1 of 10 packed/).first()).toBeVisible();
  await expectAccessible(page);
});
