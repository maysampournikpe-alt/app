import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { moderateText } from "@/lib/safety/moderation";

// GET  /api/parent/<token> — what the parent sees (also used by the student's app to check the answer)
// POST /api/parent/<token> — the parent's yes/no

async function find(token: string) {
  const db = await getDb();
  const row = await db.parentShare.findUnique({ where: { token } });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const row = await find(token);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const payload = JSON.parse(row.payloadJson);
  return NextResponse.json({ kind: row.kind, locale: row.locale, ...payload, decision: row.decision, parentNote: row.parentNote, decidedAt: row.decidedAt, createdAt: row.createdAt });
}

const Decision = z.object({ decision: z.enum(["approved", "declined"]), note: z.string().max(300).optional() });

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const row = await find(token);
  if (!row || row.kind !== "approval") return NextResponse.json({ error: "not_found" }, { status: 404 });
  let body: z.infer<typeof Decision>;
  try {
    body = Decision.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const note = body.note ? moderateText(body.note).text : null;
  const db = await getDb();
  await db.parentShare.update({ where: { token }, data: { decision: body.decision, parentNote: note, decidedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
