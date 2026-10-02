import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { clientIdentity } from "@/lib/server/ratelimit";
import { resolveViewer, canRead, postRole, findGroup, CHEERS } from "@/lib/server/people";
import { moderateText, cleanNickname } from "@/lib/safety/moderation";
import { detectCrisis } from "@/lib/safety/crisis";

// People tab posts (Phase 6). Group-based only — there is no private messaging.
// Every post is filtered on the server; reported posts are hidden after 2 reports.

const MAX_POSTS_PER_DAY = 20;
const HIDE_AFTER_REPORTS = 2;

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const g = await findGroup(sp.get("slug") ?? "");
  if (!g) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const viewer = await resolveViewer({ code: sp.get("code") ?? undefined, parentCode: sp.get("parent") ?? undefined, mentorCode: sp.get("mentor") ?? undefined });
  if (!canRead(g, viewer)) return NextResponse.json({ error: "locked" }, { status: 403 });
  const db = await getDb();
  const posts = await db.post.findMany({ where: { groupId: g.id, hidden: false }, orderBy: { createdAt: "desc" }, take: 100 });
  const { deviceHash } = clientIdentity(req);
  const shape = (p: (typeof posts)[number]) => ({ id: p.id, nickname: p.nickname, role: p.role, kind: p.kind, body: p.body, meta: p.meta ? JSON.parse(p.meta) : null, createdAt: p.createdAt, mine: p.deviceHash === deviceHash });
  const top = posts.filter((p) => !p.parentId);
  return NextResponse.json({
    group: { slug: g.slug, kind: g.kind, name: g.name, nameEs: g.nameEs, description: g.description, descEs: g.descEs, school: !!g.schoolId },
    canPost: { post: !!postRole(g, viewer, "post"), answer: !!postRole(g, viewer, "answer"), cheer: !!postRole(g, viewer, "cheer") },
    posts: top.map((p) => ({ ...shape(p), replies: posts.filter((r) => r.parentId === p.id).reverse().map(shape) })),
  });
}

const Codes = { code: z.string().max(40).optional(), parentCode: z.string().max(40).optional(), mentorCode: z.string().max(40).optional(), staffCode: z.string().max(40).optional() };
const Body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("post"),
    slug: z.string().max(80),
    kind: z.enum(["post", "question", "answer", "team", "ride", "cheer", "story"]).default("post"),
    body: z.string().trim().min(2).max(800),
    parentId: z.string().max(40).optional(),
    nickname: z.string().max(40).optional(),
    meta: z.record(z.string(), z.union([z.string().max(120), z.number(), z.array(z.string().max(40)).max(8)])).optional(),
    ...Codes,
  }),
  z.object({ action: z.literal("report"), id: z.string().max(40), reason: z.string().max(100).default("inappropriate") }),
  z.object({ action: z.literal("delete"), id: z.string().max(40) }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const b = parsed.data;
  const db = await getDb();
  const { deviceHash } = clientIdentity(req);

  if (b.action === "report") {
    // One report per device per post (the reporter is stored as a salted hash, never an identity).
    const reason = `${b.reason} · ${deviceHash}`;
    const already = await db.report.findFirst({ where: { targetType: "post", targetId: b.id, reason: { endsWith: deviceHash } } });
    const p = already ? null : await db.post.update({ where: { id: b.id }, data: { reportCount: { increment: 1 } } }).catch(() => null);
    if (p) {
      await db.report.create({ data: { targetType: "post", targetId: b.id, reason } });
      if (p.reportCount >= HIDE_AFTER_REPORTS) await db.post.update({ where: { id: b.id }, data: { hidden: true } });
    }
    return NextResponse.json({ ok: true });
  }
  if (b.action === "delete") {
    await db.post.updateMany({ where: { id: b.id, deviceHash }, data: { hidden: true } });
    return NextResponse.json({ ok: true });
  }

  const g = await findGroup(b.slug);
  if (!g) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const viewer = await resolveViewer(b);
  const role = postRole(g, viewer, b.kind);
  if (!role || !canRead(g, viewer)) return NextResponse.json({ error: "not_allowed" }, { status: 403 });

  // Cheers on shared plans are picked from a fixed list.
  if (b.kind === "cheer" && !CHEERS.includes(b.body)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // A student who writes about being in danger gets help, and the post isn't shared.
  if (detectCrisis(b.body)) return NextResponse.json({ error: "crisis" }, { status: 422 });
  const m = moderateText(b.body);
  if (m.blocked) return NextResponse.json({ error: "blocked", reason: m.reason }, { status: 422 });
  const meta = b.meta ? Object.fromEntries(Object.entries(b.meta).map(([k, v]) => [k, typeof v === "string" ? moderateText(v).text : v])) : undefined;

  const since = new Date(Date.now() - 86_400_000);
  if ((await db.post.count({ where: { deviceHash, createdAt: { gte: since } } })) >= MAX_POSTS_PER_DAY) return NextResponse.json({ error: "too_many" }, { status: 429 });

  if (b.parentId) {
    const parent = await db.post.findUnique({ where: { id: b.parentId } });
    if (!parent || parent.groupId !== g.id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const nickname = role === "staff" || role === "mentor" ? (cleanNickname(b.nickname) ?? (role === "staff" ? "Staff" : "Mentor")) : (cleanNickname(b.nickname) ?? "Student");
  await db.post.create({
    data: { groupId: g.id, parentId: b.parentId, deviceHash, nickname, role, kind: b.kind, body: m.text, meta: meta ? JSON.stringify(meta) : null },
  });
  return NextResponse.json({ ok: true, removed: m.removed });
}
