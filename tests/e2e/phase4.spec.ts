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
