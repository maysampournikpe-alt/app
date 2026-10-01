import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { schoolForCode } from "@/lib/server/school";

// GET /api/school/recommendations?code=... — opportunities teachers recommended to this school's students.
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  const school = await schoolForCode(code);
  if (!school) return NextResponse.json({ items: [] });
  const db = await getDb();
  const rows = await db.recommendation.findMany({ where: { schoolId: school.id }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json({
    items: rows.map((r) => ({ id: r.id, staffName: r.staffName, note: r.note, createdAt: r.createdAt, opp: JSON.parse(r.oppJson) })),
  });
}
