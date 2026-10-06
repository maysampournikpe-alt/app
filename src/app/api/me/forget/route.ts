import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { clientIdentity } from "@/lib/server/ratelimit";

// POST /api/me/forget — 10.6 "Delete all my data" also removes what this device shared with our server:
// group posts, reviews, event-buddy check-ins, school activity counts and hours, shared plans
// (by their codes) and parent links (by their tokens). Only things made by THIS device can be deleted.
const Body = z.object({
  parentTokens: z.array(z.string().max(80)).max(500).default([]),
  sharedPlanCodes: z.array(z.string().max(12)).max(200).default([]),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { deviceHash } = clientIdentity(req);
  const db = await getDb();
  const codes = parsed.data.sharedPlanCodes.map((c) => c.trim().toUpperCase());
  const planGroups = await db.group.findMany({ where: { kind: "shared_plan", slug: { in: codes.map((c) => `plan-${c.toLowerCase()}`) } }, select: { id: true } });
  const result = await db.$transaction([
    db.post.deleteMany({ where: { OR: [{ deviceHash }, { groupId: { in: planGroups.map((g) => g.id) } }] } }),
    db.review.deleteMany({ where: { deviceHash } }),
    db.eventAttendance.deleteMany({ where: { deviceHash } }),
    db.engagementStat.deleteMany({ where: { deviceHash } }),
    db.hoursContribution.deleteMany({ where: { deviceHash } }),
    db.group.deleteMany({ where: { id: { in: planGroups.map((g) => g.id) } } }),
    db.sharedPlan.deleteMany({ where: { code: { in: codes } } }),
    db.parentShare.deleteMany({ where: { token: { in: parsed.data.parentTokens } } }),
  ]);
  return NextResponse.json({ ok: true, deleted: result.reduce((n, r) => n + r.count, 0) });
}
