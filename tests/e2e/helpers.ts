import { type Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Start the app as an already set-up student (skips the welcome steps). */
export async function asStudent(
  page: Page,
  opts: { locale?: string; theme?: "light" | "dark"; under13?: boolean; extra?: Record<string, unknown> } = {},
) {
  const state = {
    state: {
      deviceId: "testdevice0000000001",
      consent: { onboarded: true, under13: !!opts.under13, privacyAcceptedAt: new Date().toISOString() },
      profile: {
        nickname: "Tester",
        birthYear: new Date().getFullYear() - 15,
        grade: 10,
        zip: "78539",
        interests: ["coding", "medicine", "chess"],
        skills: [],
        goals: ["get into medical school"],
        transport: "rides",
      },
      settings: { locale: opts.locale ?? "en", theme: opts.theme ?? "light", dyslexiaFont: false, largeText: false, lowData: false, onlineOnly: false, readAloudRate: 1, inAppReminders: true, studyBreakMinutes: 0 },
      ...(opts.extra ?? {}),
    },
    version: 1,
  };
  await page.addInitScript((s) => {
    if (!localStorage.getItem("rumbo-v1")) localStorage.setItem("rumbo-v1", JSON.stringify(s));
  }, state);
}

/** Collect console errors so tests can fail on them. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|favicon|tile\.openstreetmap/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

/** Fail on serious or critical accessibility problems. */
export async function expectAccessible(page: Page) {
  // The axe package is built against a newer Playwright type version; the API is the same.
  const results = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = bad.map((v) => `${v.id}: ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}

export async function waitForApp(page: Page) {
  await page.waitForSelector("main#main h1", { timeout: 20_000 });
}
