import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/server/db";

// POST /api/parent — create a private link a student can send to a parent.
// kind "summary": a list of what the student saved (dates, costs, places).
// kind "approval": one opportunity the parent can say yes or no to.
// No student name is ever included.

const Item = z.object({
  title: z.string().max(200),
  organization: z.string().max(120).optional(),
  category: z.string().max(40),
  costText: z.string().max(200).optional(),
  free: z.boolean().optional(),
  deadline: z.string().max(20).optional(),
  dateText: z.string().max(200).optional(),
  where: z.string().max(200).optional(),
  sourceUrl: z.string().url().max(600).optional(),
  status: z.string().max(20).optional(),
});
const Body = z.object({ kind: z.enum(["summary", "approval"]), locale: z.string().max(5).default("en"), items: z.array(Item).min(1).max(40), message: z.string().max(300).optional() });

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const db = await getDb();
  const token = randomBytes(18).toString("base64url");
  await db.parentShare.create({
    data: {
      token,
      kind: body.kind,
      locale: body.locale,
      payloadJson: JSON.stringify({ items: body.items, message: body.message }),
      expiresAt: new Date(Date.now() + 60 * 86_400_000),
    },
  });
  return NextResponse.json({ token });
}
