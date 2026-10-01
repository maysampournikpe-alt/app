import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

test("coach: homework mode teaches instead of answering, and chats are saved", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/coach");
  await waitForApp(page);
  await page.getByRole("button", { name: /Homework/ }).click();
  await expect(page.getByText(/teach you step by step/)).toBeVisible();
  await page.getByLabel("Message the coach").fill("What is 2x + 7 = 19?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("log").getByText(/figure this out together/)).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-coach.png`, fullPage: true });
  // Past chats keep the conversation
  await page.getByRole("button", { name: /Past chats/ }).click();
  await expect(page.getByRole("dialog").getByText("What is 2x + 7 = 19?")).toBeVisible();
  expect(errors).toEqual([]);
});

test("coach: mock interview asks one question at a time", async ({ page }) => {
  await asStudent(page);
  await page.goto("/coach?mode=interview");
  await waitForApp(page);
  await page.getByRole("button", { name: /Practice for a first job/ }).click();
  await expect(page.getByText(/Question 1:/)).toBeVisible();
  await expect(page.getByRole("log")).toHaveAttribute("aria-busy", "false");
  await page.getByLabel("Message the coach").fill("I'm a hard worker who likes helping people and I volunteer at my church food pantry every Saturday.");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Question 2:/)).toBeVisible();
});

test("coach: crisis message shows help lines", async ({ page }) => {
  await asStudent(page);
  await page.goto("/coach");
  await waitForApp(page);
  await page.getByLabel("Message the coach").fill("I want to kill myself");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("link", { name: /Call 988/ })).toBeVisible();
});

test("plan: build a plan from a goal, check steps, adjust it", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/plan");
  await waitForApp(page);
  await page.getByLabel("What's your goal?").fill("get into medical school");
  await page.getByRole("button", { name: "Make my plan" }).click();
  await expect(page).toHaveURL(/\/plan\/view\?id=/);
  await expect(page.getByRole("heading", { name: "This week" })).toBeVisible();
  const boxes = page.getByRole("checkbox");
  const total = await boxes.count();
  expect(total).toBeGreaterThan(5);
  await boxes.first().click();
  await expect(boxes.first()).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText(`1 of ${total} steps done`)).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-plan.png`, fullPage: true });
  await page.getByLabel(/Ask AI to change this plan/).fill("I only have 2 hours a week now");
  await page.getByRole("button", { name: "Update plan" }).click();
  await expect(page.getByText("Plan updated!")).toBeVisible();
  // Done step is kept
  await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-checked", "true");
  expect(errors).toEqual([]);
});

test("plan: use a ready-made template", async ({ page }) => {
  await asStudent(page);
  await page.goto("/plan");
  await waitForApp(page);
  await page.getByRole("button", { name: /Use this plan.*state chess/ }).click();
  await expect(page.getByRole("heading", { name: "Prepare for the state chess championship" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Find opportunities for:/ }).first()).toBeVisible();
});

test("me: edit profile, see saved items, download data", async ({ page }) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/me/profile");
  await waitForApp(page);
  await page.getByLabel("Nickname").fill("Valeria");
  await page.getByLabel("Skills").fill("Bilingual");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  await page.goto("/me");
  await expect(page.getByRole("heading", { name: "Hi, Valeria!" })).toBeVisible();
  await page.goto("/me/saved");
  await expect(page.getByText("Nothing saved yet")).toBeVisible();
  await page.goto("/me/data");
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my data" }).click();
  expect((await dl).suggestedFilename()).toMatch(/rumbo-my-data/);
  expect(errors).toEqual([]);
});

test("parental controls need the PIN", async ({ page }) => {
  await asStudent(page, { under13: true, extra: { parental: { pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", peopleEnabled: true, coachEnabled: true, requireApproval: true, aiSearchEnabled: true } } });
  await page.goto("/me/parental");
  await waitForApp(page);
  await page.getByLabel("Parent PIN").fill("0000");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText("That PIN isn't right.")).toBeVisible();
  await page.getByLabel("Parent PIN").fill("1234");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("switch", { name: "Allow the AI Coach" }).click();
  await page.goto("/coach");
  await expect(page.getByText("A parent turned off the Coach on this device.")).toBeVisible();
});
