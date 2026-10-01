import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { requireRole } from "@/lib/server/school";
import { clientIdentity } from "@/lib/server/ratelimit";
import { cleanNickname } from "@/lib/safety/moderation";

// POST /api/school/engagement — a student who OPTED IN shares activity COUNTS with their school.
// Only a nickname and numbers. No searches, no saved items, no chats.
const Body = z.object({
  code: z.string().max(40),
  nickname: z.string().max(40).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  searches: z.number().int().min(0).max(100000),
  saves: z.number().int().min(0).max(100000),
  applied: z.number().int().min(0).max(100000),
  planSteps: z.number().int().min(0).max(100000),
  hours: z.number().min(0).max(100000),
  monthHours: z.number().min(0).max(1000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const b = parsed.data;
  const school = await requireRole(b.code, "student");
  if (!school) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { deviceHash } = clientIdentity(req);
  const db = await getDb();
  const nickname = cleanNickname(b.nickname) ?? "Student";
  const data = { nickname, grade: b.grade, searches: b.searches, saves: b.saves, applied: b.applied, planSteps: b.planSteps, hours: b.hours };
  await db.engagementStat.upsert({
    where: { schoolId_deviceHash: { schoolId: school.id, deviceHash } },
    create: { schoolId: school.id, deviceHash, ...data },
    update: data,
  });
  if (b.monthHours !== undefined) {
    const month = new Date().toISOString().slice(0, 7);
    await db.hoursContribution.upsert({
      where: { schoolId_deviceHash_month: { schoolId: school.id, deviceHash, month } },
      create: { schoolId: school.id, deviceHash, month, hours: b.monthHours },
      update: { hours: b.monthHours },
    });
  }
  return NextResponse.json({ ok: true });
}
