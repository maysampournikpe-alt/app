import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { clientIdentity } from "@/lib/server/ratelimit";
import { requireRole } from "@/lib/server/school";
import { cleanNickname } from "@/lib/safety/moderation";

// Event buddy (6.7): see which classmates IN YOUR SCHOOL GROUP are going to the same event.
// Only nicknames are shown, and only to people with the same school code.

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const school = await requireRole(sp.get("code"), "student");
  const key = sp.get("key") ?? "";
  if (!school || !key) return NextResponse.json({ nicknames: [], me: false });
  const db = await getDb();
  const rows = await db.eventAttendance.findMany({ where: { schoolId: school.id, eventKey: key }, take: 50 });
  const { deviceHash } = clientIdentity(req);
  return NextResponse.json({ nicknames: rows.filter((r) => r.deviceHash !== deviceHash).map((r) => r.nickname), me: rows.some((r) => r.deviceHash === deviceHash) });
}

const Body = z.object({ code: z.string().max(40), key: z.string().min(3).max(80), title: z.string().max(200), nickname: z.string().max(40).optional(), going: z.boolean() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const b = parsed.data;
  const school = await requireRole(b.code, "student");
  if (!school) return NextResponse.json({ error: "not_allowed" }, { status: 403 });
  const { deviceHash } = clientIdentity(req);
  const db = await getDb();
  if (b.going) {
    const nickname = cleanNickname(b.nickname) ?? "Classmate";
    await db.eventAttendance.upsert({
      where: { schoolId_eventKey_deviceHash: { schoolId: school.id, eventKey: b.key, deviceHash } },
      create: { schoolId: school.id, eventKey: b.key, eventTitle: b.title.slice(0, 200), deviceHash, nickname },
      update: { nickname },
    });
  } else {
    await db.eventAttendance.deleteMany({ where: { schoolId: school.id, eventKey: b.key, deviceHash } });
  }
  return NextResponse.json({ ok: true });
}
