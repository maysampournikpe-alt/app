import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

async function searchAndSave(page: import("@playwright/test").Page, q: string, title: RegExp) {
  await page.goto("/");
  await waitForApp(page);
  await page.getByLabel("What are you looking for?").fill(q);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const card = page.locator("main article", { hasText: title }).first();
  await card.getByRole("button", { name: /^Save/ }).click();
  return card;
}

test("parent approval: student asks, parent says yes, student sees it", async ({ page, context }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { under13: true, extra: { parental: { peopleEnabled: true, coachEnabled: true, requireApproval: true, aiSearchEnabled: true } } });
  await searchAndSave(page, "art and writing contest", /Scholastic/);
  await page.goto("/me/saved");
  await expect(page.getByText("Waiting for a parent's OK")).toBeVisible();
  await page.getByRole("button", { name: "Ask a parent" }).click();
  const link = await page.getByRole("dialog").locator("p.font-mono").textContent();
  expect(link).toMatch(/\/parent\//);

  // The parent opens the link on their own phone.
  const parent = await context.newPage();
  await parent.goto(link!.trim());
  await expect(parent.getByRole("heading", { name: "Can I do this?" })).toBeVisible();
  await expect(parent.getByText(/Scholastic Art/)).toBeVisible();
  await expectAccessible(parent);
  await parent.screenshot({ path: `.screenshots/${info.project.name}-parent.png`, fullPage: true });
  await parent.getByLabel(/Add a note/).fill("Yes! Let's do it together.");
  await parent.getByRole("button", { name: "Yes, I approve" }).click();
  await expect(parent.getByText("Thank you! Your answer was sent.")).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Check parent's answer" }).click();
  await expect(page.getByText("Parent said yes")).toBeVisible();
  expect(errors).toEqual([]);
});

test("staff: verified posting shows in student search; dashboard and report work", async ({ page }, info) => {
  const errors = trackErrors(page);
  await page.goto("/staff");
  await waitForApp(page);
  await page.getByLabel("Staff code").fill("WRONG-CODE");
  await page.getByRole("button", { name: "Open staff tools" }).click();
  await expect(page.getByText("That isn't a staff code.")).toBeVisible();
  await page.getByLabel("Staff code").fill("RGV-STAFF");
  await page.getByRole("button", { name: "Open staff tools" }).click();
  await expect(page.getByText(/Verified staff · Demo High School/)).toBeVisible();
  await page.getByLabel("Name shown to students").fill("Mr. Lopez (Robotics)");
  const unique = `Robotics build night ${info.project.name} ${Date.now()}`;
  await page.getByLabel("Title").fill(unique);
  await page.getByLabel("Organization").fill("Demo High School Robotics");
  await page.getByLabel("Description").fill("Help build our competition robot. No experience needed — we'll teach you!");
  await page.getByLabel("Type").selectOption("club");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText(/Published!/)).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("radio", { name: "Counselor report" }).click();
  await expect(page.getByRole("heading", { name: "What students are looking for" })).toBeVisible();
  await page.getByRole("radio", { name: "Teacher dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Student engagement" })).toBeVisible();
  await page.screenshot({ path: `.screenshots/${info.project.name}-staff.png`, fullPage: true });

  // A student searching for robotics sees it with a Verified badge.
  await asStudent(page);
  await page.goto("/");
  await waitForApp(page);
  await page.getByLabel("What are you looking for?").fill("robotics club");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const card = page.locator("main article", { hasText: unique });
  await expect(card).toBeVisible();
  await expect(card.getByText("Verified")).toBeVisible();
  expect(errors).toEqual([]);
});

test("tracker, progress, resume and calendar", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page);
  await searchAndSave(page, "art and writing contest", /Scholastic/);
  await page.goto("/me/tracker");
  await waitForApp(page);
  await page.getByLabel("What did you do or win?").fill("Captain of the chess team");
  await page.getByLabel("Type").selectOption("leadership");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Captain of the chess team")).toBeVisible();
  await page.getByRole("radio", { name: "Volunteer hours" }).click();
  await page.getByLabel("Hours").fill("3");
  await page.getByLabel("Organization or event").fill("Food Bank of the RGV");
  await page.getByLabel("What you did").fill("Sorted food donations");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("3 hours total")).toBeVisible();
  await page.getByRole("radio", { name: "Certificates" }).click();
  await page.getByLabel("Certificate name").fill("CPR / First Aid");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("CPR / First Aid", { exact: true })).toBeVisible();
  await expectAccessible(page);

  await page.goto("/me/progress");
  await expect(page.getByText("Volunteer hours by month")).toBeVisible();

  await page.goto("/me/resume");
  await page.getByLabel(/Your full name/).fill("Valeria Garza");
  await page.getByRole("button", { name: /Make my bullet points stronger/ }).click();
  await expect(page.getByText(/Demo: bullet points were formatted/)).toBeVisible();
  await expect(page.getByRole("article", { name: "Preview" }).getByText("Valeria Garza")).toBeVisible();
  await expect(page.getByRole("article", { name: "Preview" }).getByText(/Food Bank of the RGV/)).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-resume.png`, fullPage: true });

  await page.goto("/plan/calendar");
  await expect(page.getByRole("heading", { name: "Deadlines & calendar" })).toBeVisible();
  await expect(page.getByText(/Scholastic Art/).first()).toBeVisible();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Add all to my phone's calendar" }).click();
  expect((await dl).suggestedFilename()).toBe("rumbo-deadlines.ics");
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-calendar.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test("join a school group and see school recommendations", async ({ page }) => {
  await asStudent(page);
  await page.goto("/me/profile");
  await waitForApp(page);
  await page.getByLabel("School code").fill("RGV-STUDENT");
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText("You're in Demo High School's group")).toBeVisible();
  await page.getByRole("switch", { name: "Share my activity with my school" }).click();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recommended by your school" })).toBeVisible();
  await expect(page.locator("section[aria-labelledby='rec-title'] article").first()).toBeVisible();
});
