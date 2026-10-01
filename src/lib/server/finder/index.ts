import "server-only";
import { z } from "zod";
import { CATEGORIES, type FinderResponse, type Opportunity } from "@/types";
import { detectCrisis, isBlockedRequest, type CrisisKind } from "@/lib/safety/crisis";
import { scamCheck } from "@/lib/safety/scam";
import { filterByAge } from "@/lib/safety/age";
import { guessCategory } from "@/lib/categories";
import { aiEnabled, estimateCostCents } from "../ai/client";
import { checkLimits, recordUsage } from "../ratelimit";
import { cacheKey, getCached, setCached } from "../cache";
import { resolveLocation, distanceTo, type ResolvedLocation } from "../geo";
import { getDb } from "../db";
import { demoSearch } from "./demo";
import { aiSearch } from "./ai";
import type { FinderRequest } from "./types";

export const FinderRequestSchema = z.object({
  query: z.string().trim().min(2).max(300),
  locale: z.string().max(5).default("en"),
  location: z
    .object({
      zip: z.string().regex(/^\d{5}$/).optional(),
      city: z.string().max(80).optional(),
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
  profile: z
    .object({
      grade: z.number().int().min(1).max(12).optional(),
      age: z.number().int().min(5).max(25).optional(),
      interests: z.array(z.string().max(40)).max(12).optional(),
      skills: z.array(z.string().max(40)).max(12).optional(),
      goals: z.array(z.string().max(120)).max(6).optional(),
      transport: z.enum(["car", "rides", "bus_walk", "unknown"]).optional(),
      firstGen: z.boolean().optional(),
    })
    .default({}),
  filters: z
    .object({
      freeOnly: z.boolean().optional(),
      category: z.enum(CATEGORIES).optional(),
      onlineOnly: z.boolean().optional(),
      paidOnly: z.boolean().optional(),
    })
    .optional(),
  lowData: z.boolean().optional(),
  schoolCode: z.string().max(40).optional(),
});

export type FinderResult = FinderResponse & { crisis?: CrisisKind; blocked?: boolean };

/** Verified opportunities posted by school staff that match the search words. */
async function staffMatches(query: string): Promise<Opportunity[]> {
  try {
    const db = await getDb();
    const posts = await db.staffPost.findMany({ where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: 200 });
    const words = query.toLowerCase().split(/[^a-záéíóúñü0-9]+/).filter((w) => w.length > 2);
    const cat = guessCategory(query);
    return posts
      .filter((p) => words.some((w) => p.keywords.includes(w)) || (cat && p.category === cat))
      .slice(0, 5)
      .map((p) => ({ ...(JSON.parse(p.oppJson) as Opportunity), id: `staff-${p.id}`, source: "staff" as const, verified: true, staffName: p.staffName }));
  } catch {
    return [];
  }
}

/** Anonymous count of what kinds of things students search for (for counselor reports). */
async function countSearch(query: string, where: ResolvedLocation | null, schoolCode?: string) {
  try {
    const db = await getDb();
    let schoolId = "all";
    if (schoolCode) {
      const school = await db.school.findUnique({ where: { studentCode: schoolCode } });
      if (school) schoolId = school.id;
    }
    const category = guessCategory(query) ?? "other";
    const day = new Date().toISOString().slice(0, 10);
    const areaKey = where?.zip3 ?? "unknown";
    await db.searchStat.upsert({
      where: { schoolId_areaKey_category_day: { schoolId, areaKey, category, day } },
      create: { schoolId, areaKey, category, day, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    /* stats are optional */
  }
}

/** Add distance, scam warnings, and remove things that don't fit the student's age. */
function finish(list: Opportunity[], req: FinderRequest, where: ResolvedLocation | null): Opportunity[] {
  let out: Opportunity[] = list.map((o): Opportunity => {
    const d = o.mode === "online" ? {} : distanceTo(where, o.city, { lat: o.lat, lng: o.lng });
    const codes = scamCheck(o).map((c) => `code:${c}`);
    const warnings = [...new Set([...(o.scamWarnings ?? []), ...codes])];
    return { ...o, lat: d.lat ?? o.lat, lng: d.lng ?? o.lng, distanceMiles: d.miles, scamWarnings: warnings.length ? warnings : undefined };
  });
  out = filterByAge(out, { age: req.profile.age, grade: req.profile.grade });
  if (req.filters?.onlineOnly) out = out.filter((o) => o.mode === "online" || o.mode === "hybrid");
  // Verified school posts first, then the rest by distance (online counts as 0 miles).
  return out.sort((a, b) => {
    if (!!b.verified !== !!a.verified) return b.verified ? 1 : -1;
    const da = a.mode === "online" ? 0 : (a.distanceMiles ?? 40);
    const db = b.mode === "online" ? 0 : (b.distanceMiles ?? 40);
    return da - db;
  });
}

export async function runFinder(httpReq: Request, input: FinderRequest): Promise<FinderResult> {
  // Safety first: serious problems get help lines, not search results.
  const crisis = detectCrisis(input.query);
  if (crisis) return { results: [], suggestions: [], demo: false, crisis };
  if (isBlockedRequest(input.query)) return { results: [], suggestions: [], demo: false, blocked: true };

  const where = resolveLocation(input.location);
  const areaLabel = where?.label;
  const staff = await staffMatches(input.query);
  void countSearch(input.query, where, input.schoolCode);

  const demo = (notice: FinderResponse["notice"]): FinderResult => {
    const d = demoSearch(input);
    return { results: finish([...staff, ...d.results], input, where), suggestions: d.suggestions, demo: true, notice, areaLabel };
  };

  if (!aiEnabled()) return demo("demo");

  const gradeBand = input.profile.grade ? (input.profile.grade <= 8 ? "ms" : "hs") : "any";
  const key = cacheKey([input.query.toLowerCase().replace(/\s+/g, " "), where?.zip3 ?? where?.label ?? "none", gradeBand, input.locale, input.filters ?? {}, !!input.lowData]);
  const cached = await getCached<FinderResponse>(key).catch(() => null);
  if (cached) {
    return { ...cached, results: finish([...staff, ...cached.results], input, where), cached: true, areaLabel };
  }

  const limit = await checkLimits(httpReq, "search");
  if (!limit.ok) return demo(limit.reason);

  try {
    const ai = await aiSearch(input, where);
    const cost = estimateCostCents(ai.model, ai.usage);
    await recordUsage(httpReq, "search", {
      inputTokens: ai.usage.input_tokens ?? 0,
      outputTokens: ai.usage.output_tokens ?? 0,
      searches: cost.searches,
      costCents: cost.cents,
    });
    const response: FinderResponse = { results: ai.results, suggestions: ai.suggestions, message: ai.message, demo: false, removedCount: ai.removed };
    if (!ai.refused && (ai.results.length || ai.suggestions.length)) await setCached(key, response);
    return { ...response, results: finish([...staff, ...ai.results], input, where), areaLabel };
  } catch (e) {
    console.error("finder AI error", e);
    return demo("error");
  }
}
