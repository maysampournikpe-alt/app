import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/server/db";
import { shortHash } from "@/lib/utils";

// Trending near you (3.1.3): anonymous counts of how many students in an area saved something.
// We store only the area (first 3 digits of a ZIP code), the public listing, and a number.

export async function GET(req: Request) {
  const area = (new URL(req.url).searchParams.get("area") ?? "").replace(/\D/g, "").slice(0, 3);
  const db = await getDb();
  const rows = await db.saveCount.findMany({
    where: area ? { areaKey: area } : {},
    orderBy: [{ count: "desc" }, { updatedAt: "desc" }],
    take: 30,
  });
  // Combine the same listing across areas when no area is given.
  const merged = new Map<string, { opp: unknown; count: number }>();
  for (const r of rows) {
    const cur = merged.get(r.oppKey);
    if (cur) cur.count += r.count;
    else merged.set(r.oppKey, { opp: JSON.parse(r.oppJson), count: r.count });
  }
  return NextResponse.json({ items: [...merged.values()].sort((a, b) => b.count - a.count).slice(0, 5) });
}

const Body = z.object({
  area: z.string().max(5).optional(),
  opp: z.object({
    id: z.string().max(80),
    title: z.string().max(200),
    organization: z.string().max(120).optional(),
    description: z.string().max(800).optional(),
    category: z.string().max(40),
    cost: z.object({ type: z.enum(["free", "paid", "unknown"]), text: z.string().max(200).optional() }),
    mode: z.enum(["online", "in_person", "hybrid", "unknown"]),
    city: z.string().max(80).optional(),
    deadline: z.string().max(10).optional(),
    sourceUrl: z.string().url().max(600),
    source: z.enum(["web", "demo", "staff"]),
  }),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { opp } = parsed.data;
  const areaKey = (parsed.data.area ?? "").replace(/\D/g, "").slice(0, 3) || "unknown";
  const oppKey = shortHash(opp.sourceUrl + "|" + opp.title.toLowerCase());
  const db = await getDb();
  const oppJson = JSON.stringify({ ...opp, carFree: opp.mode === "online" ? "yes" : "unknown" });
  await db.saveCount.upsert({
    where: { areaKey_oppKey: { areaKey, oppKey } },
    create: { areaKey, oppKey, oppJson, count: 1 },
    update: { count: { increment: 1 }, oppJson },
  });
  return NextResponse.json({ ok: true });
}
