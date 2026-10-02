import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

test("daily chess puzzle can be solved by typing the move", async ({ page }) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/coach/daily");
  await waitForApp(page);
  await page.getByRole("radio", { name: /Chess puzzle/ }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  const answer = (await page.getByText(/^Answer: /).textContent())!.replace("Answer: ", "").trim();
  await page.getByLabel(/Or type the move/).fill(answer);
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText("Correct! 🎉")).toBeVisible();
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("flashcards from notes, then study", async ({ page }, info) => {
  await asStudent(page);
  await page.goto("/coach/flashcards");
  await waitForApp(page);
  await page.getByLabel("Paste your notes").fill("mitochondria - makes energy for the cell\nnucleus - holds the DNA\nribosome - makes proteins");
  await page.getByRole("button", { name: "Make flashcards" }).click();
  await expect(page.getByText("1 of 3").first()).toBeVisible();
  await page.getByRole("button", { name: /Flip card/ }).click();
  await expect(page.getByText("makes energy for the cell", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "I know it" }).click();
  await expect(page.getByText("2 of 3").first()).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-flashcards.png`, fullPage: true });
});

test("practice test: answer every question and see a score", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await page.goto("/coach/tests");
  await waitForApp(page);
  await page.getByRole("button", { name: /Start practice test.*TSI/ }).click();
  for (let i = 0; i < 10; i++) {
    await page.locator("main fieldset input[type=radio]").first().check();
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(page.locator("main [role=note], main div[aria-live] > div").first()).toBeVisible();
    if (i === 0) await expectAccessible(page);
    await page.getByRole("button", { name: i === 9 ? "See my score" : "Next question" }).click();
  }
  await expect(page.getByText(/You got \d+ of 10/)).toBeVisible();
  await page.screenshot({ path: `.screenshots/${info.project.name}-tests.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("courses and speaking coach pages load", async ({ page }) => {
  await asStudent(page);
  await page.goto("/coach/courses");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: "Harvard CS50x" })).toBeVisible();
  await page.goto("/coach/speaking");
  await expect(page.getByRole("button", { name: "Record" })).toBeVisible();
});
