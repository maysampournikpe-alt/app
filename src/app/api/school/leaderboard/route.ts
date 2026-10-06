import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { schoolForCode } from "@/lib/server/school";

// GET /api/school/leaderboard?period=month|all&code=...
// 9.4 Volunteer hours leaderboard — SCHOOL TOTALS ONLY. No student names, nicknames or individual numbers.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const period = sp.get("period") === "all" ? "all" : "month";
  const mine = await schoolForCode(sp.get("code"));
  const db = await getDb();
  const month = new Date().toISOString().slice(0, 7);
  const rows = await db.hoursContribution.groupBy({
    by: ["schoolId"],
    where: period === "month" ? { month } : {},
    _sum: { hours: true },
  });
  const schools = await db.school.findMany({ where: { id: { in: rows.map((r) => r.schoolId) } }, select: { id: true, name: true, city: true } });
  const list = rows
    .map((r) => {
      const s = schools.find((x) => x.id === r.schoolId);
      return { name: s?.name ?? "School", city: s?.city ?? null, hours: Math.round((r._sum.hours ?? 0) * 10) / 10, yours: mine?.id === r.schoolId, demo: /^Demo /.test(s?.name ?? "") };
    })
    .filter((r) => r.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 25);
  return NextResponse.json({ period, month, schools: list });
}
