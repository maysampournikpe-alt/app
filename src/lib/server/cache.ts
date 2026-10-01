import "server-only";
import { createHash } from "node:crypto";
import { getDb } from "./db";

// 24-hour cache for AI search results: the same search costs $0 the second time.

const TTL_MS = 24 * 60 * 60 * 1000;

export function cacheKey(parts: unknown[]): string {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export async function getCached<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const row = await db.searchCache.findUnique({ where: { cacheKey: key } });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.searchCache.delete({ where: { cacheKey: key } }).catch(() => {});
    return null;
  }
  return JSON.parse(row.resultJson) as T;
}

export async function setCached(key: string, value: unknown) {
  const db = await getDb();
  const data = { resultJson: JSON.stringify(value), expiresAt: new Date(Date.now() + TTL_MS) };
  await db.searchCache.upsert({ where: { cacheKey: key }, create: { cacheKey: key, ...data }, update: data });
}
