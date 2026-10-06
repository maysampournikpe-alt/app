import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

const device = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

test("'Delete all my data' also removes what this device shared on the server", async ({ page }) => {
  const id = device();
  const body = `Forget me ${Date.now()} ${Math.random()}`;
  await asStudent(page, { extra: { deviceId: id } });
  await page.request.post("/api/people/posts", { data: { action: "post", slug: "study-english", body, code: "RGV-STUDENT" }, headers: { "x-device-id": id } });
  const share = await (await page.request.post("/api/people/shared-plan", { data: { action: "share", plan: { goal: "Forget plan", milestones: [] } } })).json();
  const plans = [{ id: "p1", goal: "Forget plan", milestones: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), source: "template", sharedCode: share.code }];
  await page.addInitScript((p) => {
    const raw = JSON.parse(localStorage.getItem("rumbo-v1") ?? "{}");
    if (raw.state && !raw.state.plans) {
      raw.state.plans = p;
      localStorage.setItem("rumbo-v1", JSON.stringify(raw));
    }
  }, plans);
  const posts = async () => ((await (await page.request.get("/api/people/posts?slug=study-english")).json()).posts as { body: string }[]).some((p) => p.body === body);
  expect(await posts()).toBe(true);

  await page.goto("/me/data");
  await waitForApp(page);
  page.on("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Delete all my data" }).click();
  await page.waitForURL("**/welcome");
  expect(await posts()).toBe(false);
  expect((await page.request.get(`/api/people/shared-plan?code=${share.code}`)).status()).toBe(404);
});

test("Vietnamese (beta) covers the first screens and search", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { locale: "vi" });
  await page.goto("/");
  await waitForApp(page);
  await expect(page.getByRole("button", { name: "Tìm", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-vi.png`, fullPage: true });
  expect(errors).toEqual([]);
});
