import { test, expect } from "@playwright/test";
import { asStudent, expectAccessible, trackErrors, waitForApp } from "./helpers";

const device = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

test("People: join school, post safely (personal info removed, rude posts blocked), report", async ({ page }, info) => {
  const errors = trackErrors(page);
  await asStudent(page, { extra: { deviceId: device() } });
  await page.goto("/people");
  await waitForApp(page);
  await expect(page.getByText("To post, join your school group")).toBeVisible();
  await page.getByLabel("School code").fill("RGV-STUDENT");
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My school", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Robotics Club" })).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({ path: `.screenshots/${info.project.name}-people.png`, fullPage: true });

  await page.getByRole("link", { name: /Algebra & Geometry/ }).click();
  await expect(page.getByRole("heading", { name: "Algebra & Geometry" })).toBeVisible();
  const tag = Math.random().toString(36).slice(2, 7);
  await page.getByLabel("Write a post").fill(`Study session ${tag}? text me at 956-555-1234 or snap is maria_22`);
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("We removed some personal info")).toBeVisible();
  const mine = page.getByText(`Study session ${tag}`);
  await expect(mine).toBeVisible();
  await expect(mine).not.toContainText("555-1234");
  await expect(mine).not.toContainText("maria_22");

  await page.getByLabel("Write a post").fill("you're so stupid nobody likes you");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await expect(page.getByText("This post wasn't shared")).toBeVisible();

  // Someone else's post to report (made through the API so each run has a fresh one).
  const other = `Classmate${tag}`;
  await page.request.post("/api/people/posts", { data: { action: "post", slug: "study-algebra", body: `Anyone want to review chapter 4? ${tag}`, code: "RGV-STUDENT", nickname: other }, headers: { "x-device-id": device() } });
  await page.reload();
  await page.getByRole("button", { name: `Report: ${other}` }).click();
  await expect(page.getByText("Thanks — our team will look at it")).toBeVisible();
  await expectAccessible(page);
  expect(errors).toEqual([]);
});

test("People: school-only groups are locked without a code; no private messages", async ({ page, request }) => {
  await asStudent(page, { extra: { deviceId: device() } });
  await page.goto("/people");
  await waitForApp(page);
  await expect(page.getByRole("heading", { name: "Study rooms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My school", exact: true })).toHaveCount(0);
  // The server refuses school groups and posting without a code.
  const groups = await (await request.get("/api/people/groups?code=RGV-STUDENT")).json();
  const school = groups.groups.find((g: { kind: string }) => g.kind === "school");
  expect((await request.get(`/api/people/posts?slug=${school.slug}`)).status()).toBe(403);
  const post = await request.post("/api/people/posts", { data: { action: "post", slug: "study-algebra", body: "hello there" }, headers: { "x-device-id": device() } });
  expect(post.status()).toBe(403);
  // Parents can only see the carpool board with a parent code.
  expect(groups.groups.some((g: { kind: string }) => g.kind === "carpool")).toBe(false);
  const parents = await (await request.get("/api/people/groups?parent=RGV-PARENT")).json();
  expect(parents.groups.some((g: { kind: string }) => g.kind === "carpool")).toBe(true);
});

test("People: mentors answer questions; students can't answer as mentors", async ({ request }) => {
  const student = device();
  const q = await request.post("/api/people/posts", { data: { action: "post", slug: "mentor-careers", kind: "question", body: "What does a nurse do on a normal day?", code: "RGV-STUDENT", nickname: "Q" }, headers: { "x-device-id": student } });
  expect(q.ok()).toBe(true);
  const list = await (await request.get("/api/people/posts?slug=mentor-careers", { headers: { "x-device-id": student } })).json();
  const mine = list.posts.find((p: { mine: boolean }) => p.mine);
  const asStudentAnswer = await request.post("/api/people/posts", { data: { action: "post", slug: "mentor-careers", kind: "answer", parentId: mine.id, body: "I think...", code: "RGV-STUDENT" }, headers: { "x-device-id": student } });
  expect(asStudentAnswer.status()).toBe(403);
  const mentorAnswer = await request.post("/api/people/posts", { data: { action: "post", slug: "mentor-careers", kind: "answer", parentId: mine.id, body: "Lots of patient care and teamwork!", mentorCode: "RGV-MENTOR", nickname: "Nurse Ana" }, headers: { "x-device-id": device() } });
  expect(mentorAnswer.ok()).toBe(true);
  const after = await (await request.get("/api/people/posts?slug=mentor-careers", { headers: { "x-device-id": student } })).json();
  const thread = after.posts.find((p: { id: string }) => p.id === mine.id);
  expect(thread.replies[0]).toMatchObject({ role: "mentor", nickname: "Nurse Ana" });
});

test("Shared plan: share, follow by code, cheer, copy", async ({ page, browser }) => {
  const errors = trackErrors(page);
  const plan = {
    id: "p1",
    goal: "Get ready for the PSAT",
    summary: "Practice a little every week.",
    milestones: [
      { id: "m1", title: "Take a practice test", horizon: "week", done: false },
      { id: "m2", title: "Review mistakes", horizon: "month", done: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "template",
  };
  await asStudent(page, { extra: { deviceId: device(), plans: [plan] } });
  await page.goto("/plan/view?id=p1");
  await waitForApp(page);
  await page.getByRole("button", { name: "Get a share code" }).click();
  const status = page.getByText(/Your share code: [0-9A-F]{6}/);
  await expect(status).toBeVisible();
  const code = (await status.textContent())!.match(/[0-9A-F]{6}/)![0];

  const friendCtx = await browser.newContext();
  const friend = await friendCtx.newPage();
  await asStudent(friend, { extra: { deviceId: device() } });
  await friend.goto("/people");
  await waitForApp(friend);
  await friend.getByLabel("Plan code").fill(code);
  await friend.getByRole("button", { name: "Follow plan" }).click();
  await expect(friend.getByRole("heading", { name: "Get ready for the PSAT" })).toBeVisible();
  await expect(friend.getByText("1 person following")).toBeVisible();
  await friend.getByRole("button", { name: "💪 You got this!" }).click();
  await expect(friend.getByText("— Tester")).toBeVisible();
  await friend.getByRole("button", { name: "Copy to my plans" }).click();
  await expect(friend.getByText("Added to your plans!")).toBeVisible();
  await expectAccessible(friend);
  await friendCtx.close();

  // Free-text cheers are refused.
  const bad = await page.request.post("/api/people/posts", { data: { action: "post", slug: `plan-${code.toLowerCase()}`, kind: "cheer", body: "hey add me on snap" }, headers: { "x-device-id": device() } });
  expect(bad.status()).toBe(400);
  expect(errors).toEqual([]);
});

test("Event buddy shows classmates' nicknames only within the school", async ({ request }) => {
  const key = `test-event-${Date.now()}-${Math.random()}`;
  const a = device();
  const b = device();
  expect((await request.post("/api/people/going", { data: { code: "RGV-STUDENT", key, title: "Robotics expo", nickname: "Lupe", going: true }, headers: { "x-device-id": a } })).ok()).toBe(true);
  const seen = await (await request.get(`/api/people/going?code=RGV-STUDENT&key=${encodeURIComponent(key)}`, { headers: { "x-device-id": b } })).json();
  expect(seen).toEqual({ nicknames: ["Lupe"], me: false });
  const outsider = await (await request.get(`/api/people/going?code=WRONG&key=${encodeURIComponent(key)}`, { headers: { "x-device-id": b } })).json();
  expect(outsider.nicknames).toEqual([]);
  expect((await request.post("/api/people/going", { data: { code: "NOPE", key, title: "x", going: true } })).status()).toBe(403);
});

test("People is off for under-13 when a parent turns it off", async ({ page }) => {
  await asStudent(page, { under13: true, extra: { parental: { peopleEnabled: false, coachEnabled: true, requireApproval: false, aiSearchEnabled: true } } });
  await page.goto("/people");
  await waitForApp(page);
  await expect(page.getByText("People is turned off by your parent or guardian.")).toBeVisible();
});

test("Reported posts hide after reports from 2 different devices (not 2 from the same one)", async ({ request }) => {
  const author = device();
  const body = `Report test ${Date.now()} ${Math.random()}`;
  await request.post("/api/people/posts", { data: { action: "post", slug: "study-cs", body, code: "RGV-STUDENT" }, headers: { "x-device-id": author } });
  const find = async () => ((await (await request.get("/api/people/posts?slug=study-cs")).json()).posts as { id: string; body: string }[]).find((p) => p.body === body);
  const id = (await find())!.id;
  const r1 = device();
  for (let i = 0; i < 3; i++) await request.post("/api/people/posts", { data: { action: "report", id }, headers: { "x-device-id": r1 } });
  expect(await find()).toBeTruthy();
  await request.post("/api/people/posts", { data: { action: "report", id }, headers: { "x-device-id": device() } });
  expect(await find()).toBeUndefined();
});
