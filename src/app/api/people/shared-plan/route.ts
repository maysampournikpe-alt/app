import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/server/db";
import { moderateText } from "@/lib/safety/moderation";

// Shared plans (6.6): friends follow the same plan with a share code and send preset cheers.

const Plan = z.object({
  goal: z.string().max(200),
  summary: z.string().max(600).optional(),
  milestones: z.array(z.object({ title: z.string().max(300), horizon: z.enum(["week", "month", "year"]), detail: z.string().max(300).optional(), searchQuery: z.string().max(120).optional() })).max(40),
});

export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").trim().toUpperCase();
  const db = await getDb();
  const sp = await db.sharedPlan.findUnique({ where: { code } });
  if (!sp) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ code: sp.code, plan: JSON.parse(sp.planJson), followers: sp.followers });
}

const Body = z.discriminatedUnion("action", [z.object({ action: z.literal("share"), plan: Plan }), z.object({ action: z.literal("follow"), code: z.string().max(12) })]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const db = await getDb();
  const b = parsed.data;
  if (b.action === "follow") {
    const code = b.code.trim().toUpperCase();
    const sp = await db.sharedPlan.update({ where: { code }, data: { followers: { increment: 1 } } }).catch(() => null);
    if (!sp) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ code, plan: JSON.parse(sp.planJson), followers: sp.followers });
  }
  // Clean every text field before sharing.
  const clean = (s?: string) => (s ? moderateText(s).text : s);
  const plan = { goal: clean(b.plan.goal)!, summary: clean(b.plan.summary), milestones: b.plan.milestones.map((m) => ({ ...m, title: clean(m.title)!, detail: clean(m.detail) })) };
  if (moderateText(`${b.plan.goal} ${b.plan.milestones.map((m) => m.title).join(" ")}`).blocked) return NextResponse.json({ error: "blocked" }, { status: 422 });
  const code = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
  await db.sharedPlan.create({ data: { code, planJson: JSON.stringify(plan) } });
  await db.group.create({ data: { kind: "shared_plan", slug: `plan-${code.toLowerCase()}`, name: plan.goal.slice(0, 80), description: "Shared plan" } });
  return NextResponse.json({ code });
}
