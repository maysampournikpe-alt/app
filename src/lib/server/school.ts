import "server-only";
import { getDb } from "./db";

export type SchoolRole = "student" | "staff" | "parent" | "mentor";

/** Find which school (and which role) a join code belongs to. Codes are not case-sensitive. */
export async function schoolForCode(code: string | undefined | null): Promise<{ id: string; name: string; role: SchoolRole } | null> {
  const c = (code ?? "").trim().toUpperCase();
  if (c.length < 4 || c.length > 40) return null;
  const db = await getDb();
  const school = await db.school.findFirst({
    where: { OR: [{ studentCode: c }, { staffCode: c }, { parentCode: c }, { mentorCode: c }] },
  });
  if (!school) return null;
  const role: SchoolRole = school.staffCode === c ? "staff" : school.parentCode === c ? "parent" : school.mentorCode === c ? "mentor" : "student";
  return { id: school.id, name: school.name, role };
}

/** Same as schoolForCode but only accepts one role (e.g. staff tools need the staff code). */
export async function requireRole(code: string | undefined | null, role: SchoolRole) {
  const s = await schoolForCode(code);
  return s && s.role === role ? s : null;
}
