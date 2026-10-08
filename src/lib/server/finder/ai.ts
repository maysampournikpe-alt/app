import "server-only";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { MODELS, EFFORT, estimateCostCents } from "../ai/client";
import { runClaude } from "../ai/run";
import { normalizeCategory } from "@/lib/categories";
import { shortHash } from "@/lib/utils";
import type { Opportunity, Suggestion } from "@/types";
import type { FinderRequest } from "./types";
import type { ResolvedLocation } from "../geo";
import { urlsFromResponse, isVerifiedUrl } from "./verify";
import { contactScripts } from "./scripts";

// ---------------- The instructions the AI follows ----------------
// Kept identical for every request so it can be cached (cheaper).
export const SYSTEM = `You are the opportunity finder inside Rumbo, an app that helps middle and high school students (ages 11-18) find real opportunities: jobs, internships, academic competitions, sports competitions, events, volunteering, clubs, scholarships, summer programs, camps, courses and certifications. Many users live in the Rio Grande Valley of South Texas, many are bilingual or from Spanish-speaking families, and many don't have a car.

Use the web_search tool (and web_fetch to read a promising page when you need details) to find REAL, CURRENT opportunities that match the student's request. Search near the student's location AND for good online options.

STRICT RULES — the app checks your work in code:
1. NEVER invent listings, organizations, dates, prices, ages, phone numbers or emails. Only put an opportunity in "results" if you found a specific web page about it during this conversation. Its "sourceUrl" MUST be copied exactly from a search result or a page you fetched. Never build or guess a URL. Listings with links that didn't come from your searches are deleted automatically.
2. If a detail is not stated on the source page, use null. Do not guess. The app will show "Not listed, check with organizer."
3. Prefer: within about 60 miles of the student or online; free or low cost; open to the student's grade/age; deadlines that have not passed. Skip expired opportunities.
4. Never include anything adults-only (18+/21+) or inappropriate for minors (gambling, alcohol, vaping, dating, adult content, weapons sales).
5. Scam check: if a listing asks for money upfront for a job, asks for a Social Security number or bank info, wants payment by gift card/crypto/wire, promises guaranteed income or a scholarship for a fee, pushes "act now", or only uses WhatsApp/DMs to apply, either skip it or (if it might still be real) add short "scamWarnings". Legit scholarships are free to apply for.
6. If you find fewer than 3 confirmed listings, add "suggestions": real kinds of local places that MIGHT offer this opportunity (for law internships: local law firms, the county courthouse, legal aid offices). Use a specific place name only if you saw it in your search results; otherwise describe the type of place. Give each a short polite emailScript and phoneScript the student can copy, with placeholders like [your first name] and [your school]. Never include the student's personal information.
7. Write "message", "description", "whyFits", "eligibility", "dateText", "why" and the scripts in the language requested. Keep URLs and organization names as they are.
8. "description": at most 45 words, plain words a 12-year-old understands. "whyFits": one short sentence that connects to the student's profile (interests, goals, grade, transportation). Don't mention the student's age if under 13.
9. Use dates in YYYY-MM-DD only when the exact date is stated; otherwise describe it in "dateText".
10. "carFree": "yes" if online or the source mentions public transit, provided transportation, or it's at the student's school; "no" if the source says students need their own transportation; otherwise "unknown".
11. "category" must be one of: job, internship, academic_competition, sports_competition, event, volunteer, club, scholarship, summer_program, camp, course, certification.
12. "costType": "free", "paid", or null if unknown. Put fee waivers or scholarships for paid programs in "feeWaiver". "paid": true only if the student earns money.

When you are done searching, reply with ONLY one JSON object wrapped in <json></json> tags, no other text:
<json>
{
  "message": "one friendly sentence summarizing what you found",
  "results": [
    {
      "title": "...", "organization": "...", "description": "...", "category": "...",
      "costType": "free|paid|null", "costText": "...|null", "feeWaiver": "...|null",
      "paid": true|false|null, "payText": "...|null",
      "gradeMin": 9|null, "gradeMax": 12|null, "ageMin": 14|null, "ageMax": 18|null, "eligibility": "...|null",
      "startDate": "YYYY-MM-DD|null", "endDate": "YYYY-MM-DD|null", "deadline": "YYYY-MM-DD|null", "dateText": "...|null",
      "mode": "online|in_person|hybrid|unknown", "city": "City, ST|null", "address": "public address of the organization|null",
      "carFree": "yes|no|unknown", "transitNote": "...|null",
      "sourceUrl": "exact URL from your search", "whyFits": "...", "scamWarnings": []
    }
  ],
  "suggestions": [
    { "name": "...", "kind": "...", "why": "...", "city": "...|null", "website": "exact URL from your search|null", "howToFind": "...", "emailScript": "...", "phoneScript": "..." }
  ]
}
</json>`;

// ---------------- Checking the AI's answer ----------------
const nullish = <T extends z.ZodTypeAny>(s: T) => z.preprocess((v) => (v === null || v === "" || v === "null" ? undefined : v), s.optional());
const num = nullish(z.coerce.number().int().min(0).max(30));
const str = (max = 600) => nullish(z.string().transform((s) => s.slice(0, max)));
const isoDate = nullish(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

const ResultSchema = z.object({
  title: z.string().min(2).transform((s) => s.slice(0, 160)),
  organization: str(120),
  description: str(600),
  category: str(40),
  costType: nullish(z.enum(["free", "paid", "unknown"]).catch("unknown")),
  costText: str(160),
  feeWaiver: str(240),
  paid: nullish(z.boolean().catch(false)),
  payText: str(120),
  gradeMin: num,
  gradeMax: num,
  ageMin: num,
  ageMax: num,
  eligibility: str(300),
  startDate: isoDate.catch(undefined),
  endDate: isoDate.catch(undefined),
  deadline: isoDate.catch(undefined),
  dateText: str(200),
  mode: nullish(z.enum(["online", "in_person", "hybrid", "unknown"]).catch("unknown")),
  city: str(80),
  address: str(160),
  carFree: nullish(z.enum(["yes", "no", "unknown"]).catch("unknown")),
  transitNote: str(200),
  sourceUrl: z.string().url(),
  whyFits: str(240),
  scamWarnings: nullish(z.array(z.string().max(200)).max(5).catch([])),
});

const SuggestionSchema = z.object({
  name: z.string().min(2).max(140),
  kind: str(80),
  why: str(300),
  city: str(80),
  website: str(400),
  howToFind: str(240),
  emailScript: str(1500),
  phoneScript: str(1200),
});

const AnswerSchema = z.object({
  message: str(400),
  results: z.array(z.unknown()).catch([]).default([]),
  suggestions: z.array(z.unknown()).catch([]).default([]),
});

/** Pull the JSON object out of the AI's reply. */
export function extractJson(text: string): unknown {
  const tagged = [...text.matchAll(/<json>([\s\S]*?)<\/json>/g)].pop()?.[1];
  const candidate = tagged ?? text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try {
    return JSON.parse(candidate.trim());
  } catch {
    return null;
  }
}

/** Convert the AI's JSON into our Opportunity/Suggestion types, dropping anything invalid or unverified. */
export function parseFinderAnswer(
  text: string,
  knownUrls: Set<string>,
  ctx: { locale: string; topic: string; grade?: number },
): { results: Opportunity[]; suggestions: Suggestion[]; message?: string; removed: number } {
  const parsed = AnswerSchema.safeParse(extractJson(text));
  if (!parsed.success) return { results: [], suggestions: [], removed: 0 };
  let removed = 0;
  const results: Opportunity[] = [];
  const seen = new Set<string>();
  for (const raw of parsed.data.results) {
    const r = ResultSchema.safeParse(raw);
    if (!r.success) {
      removed++;
      continue;
    }
    const x = r.data;
    // THE KEY CHECK: the link must be one the web search really returned.
    if (!isVerifiedUrl(x.sourceUrl, knownUrls)) {
      removed++;
      continue;
    }
    const id = `web-${shortHash(`${x.sourceUrl}|${x.title.toLowerCase()}`)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({
      id,
      title: x.title,
      organization: x.organization ?? "",
      description: x.description ?? "",
      category: normalizeCategory(x.category, `${x.title} ${x.description ?? ""}`),
      cost: { type: x.costType ?? "unknown", text: x.costText, feeWaiver: x.feeWaiver },
      paid: x.paid,
      payText: x.payText,
      grades: x.gradeMin !== undefined || x.gradeMax !== undefined ? { min: x.gradeMin, max: x.gradeMax } : undefined,
      ages: x.ageMin !== undefined || x.ageMax !== undefined ? { min: x.ageMin, max: x.ageMax } : undefined,
      eligibility: x.eligibility,
      startDate: x.startDate,
      endDate: x.endDate,
      deadline: x.deadline,
      dateText: x.dateText,
      mode: x.mode ?? "unknown",
      city: x.city,
      address: x.address,
      carFree: x.mode === "online" ? "yes" : (x.carFree ?? "unknown"),
      transitNote: x.transitNote,
      sourceUrl: x.sourceUrl,
      source: "web",
      whyFits: x.whyFits,
      scamWarnings: x.scamWarnings?.length ? x.scamWarnings : undefined,
      foundAt: new Date().toISOString(),
    });
  }
  const suggestions: Suggestion[] = [];
  for (const raw of parsed.data.suggestions.slice(0, 5)) {
    const s = SuggestionSchema.safeParse(raw);
    if (!s.success) continue;
    const x = s.data;
    const fallback = contactScripts(ctx.locale, x.name, ctx.topic, ctx.grade);
    suggestions.push({
      id: `sug-${shortHash(x.name)}`,
      name: x.name,
      kind: x.kind ?? "",
      why: x.why ?? "",
      city: x.city,
      // Suggestion websites must also come from the search — otherwise we just hide the link.
      website: x.website && isVerifiedUrl(x.website, knownUrls) ? x.website : undefined,
      howToFind: x.howToFind,
      emailScript: x.emailScript ?? fallback.email,
      phoneScript: x.phoneScript ?? fallback.phone,
    });
  }
  return { results, suggestions, message: parsed.data.message, removed };
}

// ---------------- Calling the AI ----------------
const LANG_NAMES: Record<string, string> = { en: "English", es: "Spanish (Latin American, friendly, simple)", vi: "Vietnamese" };

/** The search request in words, shared by Claude and Groq search. */
export function requestLines(req: FinderRequest, where: ResolvedLocation | null): string[] {
  const p = req.profile;
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    `Student request: """${req.query.slice(0, 300)}"""`,
    `Today's date: ${today}`,
    where ? `Student location: ${where.label} (search near here, and also include online options)` : "Student location: unknown — focus on online options and Texas statewide programs.",
    `Student: ${p.grade ? `grade ${p.grade}` : "grade unknown"}${p.age ? `, age ${p.age}` : ""}${p.interests?.length ? `, interests: ${p.interests.join(", ")}` : ""}${p.goals?.length ? `, goals: ${p.goals.join("; ")}` : ""}${p.firstGen ? ", first-generation college student" : ""}.`,
    `Transportation: ${p.transport === "bus_walk" ? "no car — bus, bike or walking" : p.transport === "rides" ? "depends on rides from family" : p.transport === "car" ? "has a car" : "unknown"}.`,
    `Write all text in: ${LANG_NAMES[req.locale] ?? "English"}.`,
    req.filters?.freeOnly ? "Only free opportunities." : "",
    req.filters?.paidOnly ? "Only opportunities where the student gets paid." : "",
    req.filters?.onlineOnly ? "Only online opportunities (the student can't travel)." : "",
    req.filters?.category ? `Category wanted: ${req.filters.category}.` : "",
    `Return at most ${req.lowData ? 5 : 8} results.`,
  ].filter(Boolean);
  return lines;
}

export async function aiSearch(req: FinderRequest, where: ResolvedLocation | null) {
  const p = req.profile;
  const lines = requestLines(req, where);

  const tools: Anthropic.Beta.Messages.BetaToolUnion[] = [
    {
      type: "web_search_20260209",
      name: "web_search",
      max_uses: req.lowData ? 3 : 5,
      ...(where ? { user_location: { type: "approximate" as const, city: where.city, region: where.stateName, country: "US", timezone: "America/Chicago" } } : {}),
    },
    { type: "web_fetch_20260209", name: "web_fetch", max_uses: req.lowData ? 1 : 3, max_content_tokens: 6000 },
  ];

  const run = await runClaude({
    model: MODELS.finder,
    max_tokens: 16000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    tools,
    output_config: { effort: EFFORT.finder },
    messages: [{ role: "user", content: lines.join("\n") }],
  });

  if (run.stopReason === "refusal") {
    return { results: [], suggestions: [], message: undefined, removed: 0, usage: run.usage, model: run.model, refused: true };
  }
  const known = urlsFromResponse(run.content as unknown[]);
  const parsed = parseFinderAnswer(run.text, known, { locale: req.locale, topic: req.query.slice(0, 60), grade: p.grade });
  return { ...parsed, usage: run.usage, model: run.model, refused: false, cost: estimateCostCents(run.model, run.usage) };
}
