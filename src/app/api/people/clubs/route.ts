import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { schoolForCode } from "@/lib/server/school";

// GET /api/people/clubs?code=... — the club directory for the school this code belongs to.
export async function GET(req: Request) {
  const school = await schoolForCode(new URL(req.url).searchParams.get("code"));
  if (!school) return NextResponse.json({ clubs: [] });
  const db = await getDb();
  const clubs = await db.club.findMany({ where: { schoolId: school.id }, orderBy: { name: "asc" } });
  return NextResponse.json({ school: school.name, clubs: clubs.map((c) => ({ id: c.id, name: c.name, description: c.description, meets: c.meets, sponsor: c.sponsor })) });
}
