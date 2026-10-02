import "server-only";
import type { Group } from "@prisma/client";
import { getDb } from "./db";
import { schoolForCode } from "./school";

// Who someone is on the People tab, based ONLY on the codes their device has.
// There are no accounts: a code from a teacher/school proves membership.

export interface PeopleCodes {
  code?: string; // student code (school group)
  parentCode?: string;
  mentorCode?: string;
  staffCode?: string;
}

export interface Viewer {
  studentSchool: { id: string; name: string } | null;
  parentSchool: { id: string; name: string } | null;
  mentor: boolean;
  staffSchool: { id: string; name: string } | null;
}

export async function resolveViewer(c: PeopleCodes): Promise<Viewer> {
  const [s, p, m, st] = await Promise.all([schoolForCode(c.code), schoolForCode(c.parentCode), schoolForCode(c.mentorCode), schoolForCode(c.staffCode)]);
  return {
    studentSchool: s?.role === "student" ? { id: s.id, name: s.name } : null,
    parentSchool: p?.role === "parent" ? { id: p.id, name: p.name } : null,
    mentor: m?.role === "mentor",
    staffSchool: st?.role === "staff" ? { id: st.id, name: st.name } : null,
  };
}

/** Can this viewer READ the group? */
export function canRead(g: Group, v: Viewer): boolean {
  if (g.kind === "shared_plan") return true; // knowing the plan code is the key
  if (!g.schoolId) return true; // open, moderated groups
  if (v.staffSchool?.id === g.schoolId) return true;
  if (g.kind === "carpool") return v.parentSchool?.id === g.schoolId;
  return v.studentSchool?.id === g.schoolId || v.parentSchool?.id === g.schoolId;
}

export type PostRole = "student" | "staff" | "mentor" | "parent";

/**
 * Which role (if any) this viewer may POST with in this group.
 * Students must belong to a school group (code) to post anywhere — so every
 * student poster is connected to a real school.
 */
export function postRole(g: Group, v: Viewer, kind: string): PostRole | null {
  if (v.staffSchool && (!g.schoolId || g.schoolId === v.staffSchool.id)) return "staff";
  if (g.kind === "carpool") return v.parentSchool?.id === g.schoolId ? "parent" : null;
  if (g.kind === "alumni") return null; // only staff post stories
  if (g.kind === "mentor") {
    if (kind === "answer") return v.mentor ? "mentor" : null;
    return v.studentSchool ? "student" : null;
  }
  if (g.kind === "shared_plan") return kind === "cheer" ? "student" : null;
  if (v.mentor && !g.schoolId) return "mentor";
  if (g.schoolId) return v.studentSchool?.id === g.schoolId ? "student" : null;
  return v.studentSchool ? "student" : null;
}

export async function findGroup(slug: string) {
  const db = await getDb();
  return db.group.findUnique({ where: { slug } });
}

export { ALL_CHEERS as CHEERS } from "@/data/cheers";
