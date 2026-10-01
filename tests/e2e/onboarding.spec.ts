import { test, expect } from "@playwright/test";
import { trackErrors } from "./helpers";

test("new student (age 15) completes welcome steps", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome/);
  const main = page.locator("main");
  await main.getByRole("button", { name: "Español" }).click();
  await expect(page.getByRole("heading", { name: "¡Hola! Soy Rumbo." })).toBeVisible();
  await main.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Let's start" }).click();
  await page.getByLabel("Birth year").selectOption(String(new Date().getFullYear() - 15));
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Tell me a little about you" })).toBeVisible();
  await page.getByLabel("What grade are you in?").selectOption("10");
  await page.getByLabel("ZIP code").fill("78501");
  await page.getByRole("button", { name: /Coding/ }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Let's go!" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("student under 13 needs a parent to agree", async ({ page }) => {
  await page.goto("/welcome");
  await page.getByRole("button", { name: "Let's start" }).click();
  await page.getByLabel("Birth year").selectOption(String(new Date().getFullYear() - 11));
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "A parent or guardian needs to say yes" })).toBeVisible();
  const agree = page.getByRole("button", { name: "I agree" });
  await expect(agree).toBeDisabled();
  await page.getByLabel("I am this student's parent or legal guardian.").check();
  await page.getByLabel(/I have read the summary/).check();
  await page.getByLabel("You are their…").selectOption("mom");
  await page.getByLabel(/parent PIN/).fill("1234");
  await expect(agree).toBeEnabled();
  await agree.click();
  await expect(page.getByRole("heading", { name: "Tell me a little about you" })).toBeVisible();
});
