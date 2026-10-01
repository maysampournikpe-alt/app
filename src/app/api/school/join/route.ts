import { NextResponse } from "next/server";
import { z } from "zod";
import { schoolForCode } from "@/lib/server/school";

// POST /api/school/join — check a school code and tell the app which school and role it is for.
export async function POST(req: Request) {
  const parsed = z.object({ code: z.string().max(40) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const school = await schoolForCode(parsed.data.code);
  if (!school) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ schoolId: school.id, schoolName: school.name, role: school.role, code: parsed.data.code.trim().toUpperCase() });
}
