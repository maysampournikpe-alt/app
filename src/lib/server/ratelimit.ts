import "server-only";
import { createHash } from "node:crypto";
import { getDb } from "./db";

// Keeps AI costs low:
//  1. Each device gets a daily number of AI requests per feature.
//  2. Each network (IP) gets a bigger daily limit (school Wi-Fi is shared, so it's generous).
//  3. The whole app has a daily dollar budget. When it's used up, the app
//     switches to cached and sample results instead of spending more.
// IP addresses and device IDs are only stored as one-way scrambled hashes.

export type LimitedRoute = "search" | "coach" | "task";

const DAILY_LIMITS: Record<LimitedRoute, number> = {
  search: Number(process.env.DAILY_SEARCH_LIMIT ?? 15),
  coach: Number(process.env.DAILY_CHAT_LIMIT ?? 60),
  task: Number(process.env.DAILY_TASK_LIMIT ?? 30),
};
const IP_MULTIPLIER = 15;
const DAILY_BUDGET_CENTS = Number(process.env.DAILY_BUDGET_USD ?? 3) * 100;

function hash(value: string): string {
  const salt = process.env.HASH_SALT ?? "rumbo-default-salt";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

export function clientIdentity(req: Request): { deviceHash: string; ipHash: string } {
  const device = (req.headers.get("x-device-id") ?? "").slice(0, 64) || "unknown-device";
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return { deviceHash: `d:${hash(device)}`, ipHash: `i:${hash(ip)}` };
}

function startOfDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export type LimitResult = { ok: true } | { ok: false; reason: "limit" | "budget" };

/** Check limits BEFORE calling the AI. */
export async function checkLimits(req: Request, route: LimitedRoute): Promise<LimitResult> {
  const db = await getDb();
  const since = startOfDay();
  const { deviceHash, ipHash } = clientIdentity(req);
  const [deviceCount, ipCount, spent] = await Promise.all([
    db.usageEvent.count({ where: { clientHash: deviceHash, route, createdAt: { gte: since } } }),
    db.usageEvent.count({ where: { clientHash: ipHash, route, createdAt: { gte: since } } }),
    db.usageEvent.aggregate({ _sum: { costCents: true }, where: { createdAt: { gte: since }, clientHash: { startsWith: "d:" } } }),
  ]);
  if ((spent._sum.costCents ?? 0) >= DAILY_BUDGET_CENTS) return { ok: false, reason: "budget" };
  if (deviceCount >= DAILY_LIMITS[route]) return { ok: false, reason: "limit" };
  if (ipCount >= DAILY_LIMITS[route] * IP_MULTIPLIER) return { ok: false, reason: "limit" };
  return { ok: true };
}

/** Record an AI call AFTER it finishes (with its estimated cost). */
export async function recordUsage(
  req: Request,
  route: LimitedRoute,
  usage: { inputTokens: number; outputTokens: number; searches: number; costCents: number },
) {
  const db = await getDb();
  const { deviceHash, ipHash } = clientIdentity(req);
  await db.usageEvent.createMany({
    data: [
      { clientHash: deviceHash, route, ...usage },
      // The IP row only counts requests; its cost is 0 so spending isn't counted twice.
      { clientHash: ipHash, route, inputTokens: 0, outputTokens: 0, searches: 0, costCents: 0 },
    ],
  });
  // Old rows aren't needed after a few days.
  if (Math.random() < 0.02) {
    await db.usageEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 3 * 86_400_000) } } });
  }
}

export function remainingFor(route: LimitedRoute) {
  return DAILY_LIMITS[route];
}
