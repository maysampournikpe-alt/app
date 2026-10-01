import { NextResponse } from "next/server";
import { runFinder, FinderRequestSchema } from "@/lib/server/finder";

// POST /api/search — the Opportunity Finder. Runs only on the server, where the AI key lives.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const parsed = FinderRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const result = await runFinder(req, parsed.data);
  return NextResponse.json(result);
}
