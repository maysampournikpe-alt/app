import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { resolveViewer, canRead } from "@/lib/server/people";

// GET /api/people/groups — the groups this device can see.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const viewer = await resolveViewer({ code: sp.get("code") ?? undefined, parentCode: sp.get("parent") ?? undefined, mentorCode: sp.get("mentor") ?? undefined });
  const db = await getDb();
  const groups = (await db.group.findMany({ where: { kind: { not: "shared_plan" } }, orderBy: { name: "asc" } })).filter((g) => canRead(g, viewer));
  const counts = await db.post.groupBy({ by: ["groupId"], where: { groupId: { in: groups.map((g) => g.id) }, hidden: false }, _count: true });
  return NextResponse.json({
    viewer: { school: viewer.studentSchool?.name ?? viewer.parentSchool?.name ?? null, mentor: viewer.mentor, parent: !!viewer.parentSchool },
    groups: groups.map((g) => ({
      slug: g.slug,
      kind: g.kind,
      school: !!g.schoolId,
      name: g.name,
      nameEs: g.nameEs,
      description: g.description,
      descEs: g.descEs,
      posts: counts.find((c) => c.groupId === g.id)?._count ?? 0,
    })),
  });
}
