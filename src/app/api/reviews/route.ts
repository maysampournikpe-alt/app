import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { clientIdentity } from "@/lib/server/ratelimit";
import { moderateText, cleanNickname } from "@/lib/safety/moderation";

// Student reviews (3.1.9): ratings and short tips, filtered and reportable.
// Hidden automatically after 2 reports until staff review them.

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") ?? "";
  if (!key) return NextResponse.json({ reviews: [], avg: null });
  const db = await getDb();
  const rows = await db.review.findMany({ where: { oppKey: key, hidden: false }, orderBy: { createdAt: "desc" }, take: 20 });
  const avg = rows.length ? rows.reduce((n, r) => n + r.rating, 0) / rows.length : null;
  return NextResponse.json({ avg, reviews: rows.map((r) => ({ id: r.id, nickname: r.nickname, rating: r.rating, tip: r.tip, createdAt: r.createdAt })) });
}

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("post"), key: z.string().min(3).max(80), rating: z.number().int().min(1).max(5), tip: z.string().trim().min(3).max(400), nickname: z.string().max(40).optional() }),
  z.object({ action: z.literal("report"), id: z.string().max(40), reason: z.string().max(100).default("inappropriate") }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const db = await getDb();
  const b = parsed.data;
  if (b.action === "report") {
    const r = await db.review.update({ where: { id: b.id }, data: { reportCount: { increment: 1 } } }).catch(() => null);
    if (r) {
      await db.report.create({ data: { targetType: "review", targetId: b.id, reason: b.reason } });
      if (r.reportCount >= 2) await db.review.update({ where: { id: b.id }, data: { hidden: true } });
    }
    return NextResponse.json({ ok: true });
  }
  const m = moderateText(b.tip);
  if (m.blocked) return NextResponse.json({ error: "blocked" }, { status: 422 });
  const { deviceHash } = clientIdentity(req);
  const nickname = cleanNickname(b.nickname) ?? "Student";
  await db.review.upsert({
    where: { oppKey_deviceHash: { oppKey: b.key, deviceHash } },
    create: { oppKey: b.key, deviceHash, nickname, rating: b.rating, tip: m.text },
    update: { nickname, rating: b.rating, tip: m.text, hidden: false, reportCount: 0 },
  });
  return NextResponse.json({ ok: true, removed: m.removed });
}
