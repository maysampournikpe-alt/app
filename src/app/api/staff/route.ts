import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { requireRole } from "@/lib/server/school";
import { moderateText } from "@/lib/safety/moderation";
import { scamCheck } from "@/lib/safety/scam";
import { CATEGORIES } from "@/types";

// POST /api/staff — tools for VERIFIED school staff (they prove it with their school's staff code).
// Actions: verify, post (opportunity with Verified badge), my-posts, remove-post, recommend,
// dashboard (teacher view), report (counselor view), add-club, remove-club, clubs, moderation, moderate.

const Opp = z.object({
  title: z.string().trim().min(3).max(160),
  organization: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(800),
  category: z.enum(CATEGORIES),
  free: z.boolean(),
  costText: z.string().max(160).optional(),
  gradeMin: z.number().int().min(1).max(12).optional(),
  gradeMax: z.number().int().min(1).max(12).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateText: z.string().max(200).optional(),
  online: z.boolean(),
  city: z.string().max(80).optional(),
  sourceUrl: z.string().url().max(600).optional(),
});

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify"), code: z.string() }),
  z.object({ action: z.literal("post"), code: z.string(), staffName: z.string().trim().min(2).max(60), opp: Opp }),
  z.object({ action: z.literal("my-posts"), code: z.string() }),
  z.object({ action: z.literal("remove-post"), code: z.string(), id: z.string() }),
  z.object({ action: z.literal("recommend"), code: z.string(), staffName: z.string().trim().min(2).max(60), note: z.string().max(300), opp: z.record(z.string(), z.unknown()) }),
  z.object({ action: z.literal("dashboard"), code: z.string() }),
  z.object({ action: z.literal("report"), code: z.string(), days: z.number().int().min(1).max(365).default(30) }),
  z.object({ action: z.literal("add-club"), code: z.string(), name: z.string().trim().min(2).max(80), description: z.string().trim().min(5).max(400), meets: z.string().max(120).optional(), sponsor: z.string().max(80).optional() }),
  z.object({ action: z.literal("remove-club"), code: z.string(), id: z.string() }),
  z.object({ action: z.literal("moderation"), code: z.string() }),
  z.object({ action: z.literal("moderate"), code: z.string(), id: z.string(), target: z.enum(["post", "review"]), hide: z.boolean() }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const b = parsed.data;
  const school = await requireRole(b.code, "staff");
  if (!school) return NextResponse.json({ error: "not_staff" }, { status: 403 });
  const db = await getDb();

  switch (b.action) {
    case "verify":
      return NextResponse.json({ schoolId: school.id, schoolName: school.name });

    case "post": {
      const o = b.opp;
      const desc = moderateText(o.description);
      if (desc.blocked) return NextResponse.json({ error: "blocked" }, { status: 422 });
      const opp = {
        id: "",
        title: o.title,
        organization: o.organization,
        description: o.description,
        category: o.category,
        cost: { type: o.free ? "free" : "paid", text: o.costText },
        grades: o.gradeMin || o.gradeMax ? { min: o.gradeMin, max: o.gradeMax } : undefined,
        deadline: o.deadline,
        startDate: o.startDate,
        dateText: o.dateText,
        mode: o.online ? "online" : "in_person",
        city: o.city,
        carFree: o.online ? "yes" : "unknown",
        sourceUrl: o.sourceUrl,
        source: "staff",
        verified: true,
        staffName: `${b.staffName} · ${school.name}`,
      };
      const flags = scamCheck(opp as never);
      if (flags.length) return NextResponse.json({ error: "scam_flags", flags }, { status: 422 });
      const keywords = `${o.title} ${o.organization} ${o.description} ${o.category.replace("_", " ")}`.toLowerCase().replace(/[^a-záéíóúñü0-9 ]/g, " ");
      const row = await db.staffPost.create({ data: { schoolId: school.id, staffName: opp.staffName, oppJson: JSON.stringify(opp), keywords, category: o.category } });
      return NextResponse.json({ id: row.id });
    }

    case "my-posts": {
      const rows = await db.staffPost.findMany({ where: { schoolId: school.id, status: "approved" }, orderBy: { createdAt: "desc" }, take: 50 });
      return NextResponse.json({ items: rows.map((r) => ({ id: r.id, createdAt: r.createdAt, opp: JSON.parse(r.oppJson) })) });
    }

    case "remove-post":
      await db.staffPost.updateMany({ where: { id: b.id, schoolId: school.id }, data: { status: "removed" } });
      return NextResponse.json({ ok: true });

    case "recommend": {
      const note = moderateText(b.note);
      await db.recommendation.create({ data: { schoolId: school.id, staffName: b.staffName, note: note.text, oppJson: JSON.stringify(b.opp).slice(0, 8000) } });
      return NextResponse.json({ ok: true });
    }

    case "dashboard": {
      const rows = await db.engagementStat.findMany({ where: { schoolId: school.id }, orderBy: { updatedAt: "desc" }, take: 200 });
      return NextResponse.json({
        students: rows.map((r) => ({ nickname: r.nickname, grade: r.grade, searches: r.searches, saves: r.saves, applied: r.applied, planSteps: r.planSteps, hours: r.hours, updatedAt: r.updatedAt })),
      });
    }

    case "report": {
      const since = new Date(Date.now() - b.days * 86_400_000).toISOString().slice(0, 10);
      const [mine, area] = await Promise.all([
        db.searchStat.groupBy({ by: ["category"], where: { schoolId: school.id, day: { gte: since } }, _sum: { count: true } }),
        db.searchStat.groupBy({ by: ["category"], where: { day: { gte: since } }, _sum: { count: true } }),
      ]);
      const toList = (rows: { category: string; _sum: { count: number | null } }[]) =>
        rows.map((r) => ({ category: r.category, count: r._sum.count ?? 0 })).sort((a, b2) => b2.count - a.count);
      const engagement = await db.engagementStat.aggregate({ where: { schoolId: school.id }, _count: true, _sum: { hours: true, applied: true, saves: true } });
      return NextResponse.json({
        school: toList(mine),
        everyone: toList(area),
        totals: { students: engagement._count, hours: engagement._sum.hours ?? 0, applied: engagement._sum.applied ?? 0, saves: engagement._sum.saves ?? 0 },
      });
    }

    case "add-club": {
      const d = moderateText(b.description);
      if (d.blocked) return NextResponse.json({ error: "blocked" }, { status: 422 });
      await db.club.create({ data: { schoolId: school.id, name: b.name, description: d.text, meets: b.meets, sponsor: b.sponsor } });
      return NextResponse.json({ ok: true });
    }

    case "remove-club":
      await db.club.deleteMany({ where: { id: b.id, schoolId: school.id } });
      return NextResponse.json({ ok: true });

    case "moderation": {
      // Posts in this school's groups, plus open groups, that were reported or hidden.
      const groups = await db.group.findMany({ where: { OR: [{ schoolId: school.id }, { schoolId: null }] }, select: { id: true, name: true } });
      const posts = await db.post.findMany({
        where: { groupId: { in: groups.map((g) => g.id) }, OR: [{ reportCount: { gt: 0 } }, { hidden: true }] },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      const reviews = await db.review.findMany({ where: { OR: [{ reportCount: { gt: 0 } }, { hidden: true }] }, orderBy: { createdAt: "desc" }, take: 50 });
      return NextResponse.json({
        posts: posts.map((p) => ({ id: p.id, group: groups.find((g) => g.id === p.groupId)?.name, nickname: p.nickname, body: p.body, hidden: p.hidden, reports: p.reportCount, createdAt: p.createdAt })),
        reviews: reviews.map((r) => ({ id: r.id, nickname: r.nickname, body: r.tip, hidden: r.hidden, reports: r.reportCount, createdAt: r.createdAt })),
      });
    }

    case "moderate":
      if (b.target === "post") await db.post.update({ where: { id: b.id }, data: { hidden: b.hide, reportCount: b.hide ? undefined : 0 } });
      else await db.review.update({ where: { id: b.id }, data: { hidden: b.hide, reportCount: b.hide ? undefined : 0 } });
      return NextResponse.json({ ok: true });
  }
}
