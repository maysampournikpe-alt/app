import "server-only";
import { groqMessage } from "../ai/groq";
import type { ResolvedLocation } from "../geo";
import type { FinderRequest } from "./types";
import { SYSTEM, parseFinderAnswer, requestLines } from "./ai";
import { collectUrls, normalizeUrl } from "./verify";

// Free web search with Groq's "compound" models, which run real web searches.
// The same no-invention rule applies: a listing is kept ONLY if its link appears in the
// search results Groq actually returned (its "executed_tools" record). Links that only
// show up in the model's own answer are thrown away.

const SEARCH_MODELS = [...new Set([process.env.GROQ_SEARCH_MODEL || "groq/compound", "groq/compound", "groq/compound-mini"])];

/** Every URL found in the web-search tool results (not in the model's own text). */
export function urlsFromGroq(raw: unknown): Set<string> {
  const out = new Set<string>();
  const tools = (raw as { executed_tools?: unknown } | null)?.executed_tools;
  if (!tools) return out;
  collectUrls(tools, out);
  // Some tool outputs are plain text; pick links out of those too.
  const text = JSON.stringify(tools);
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>\\)\]]+/g)) {
    const n = normalizeUrl(m[0].replace(/[.,;:]+$/, ""));
    if (n) out.add(n);
  }
  return out;
}

export async function groqSearch(req: FinderRequest, where: ResolvedLocation | null) {
  const lines = requestLines(req, where);
  const { content, raw, model } = await groqMessage(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: `${lines.join("\n")}\n\nSearch the web now. Only list opportunities whose page you found in your search results, and use that exact page URL as sourceUrl.` },
    ],
    SEARCH_MODELS,
  );
  const known = urlsFromGroq(raw);
  const parsed = parseFinderAnswer(content, known, { locale: req.locale, topic: req.query.slice(0, 60), grade: req.profile.grade });
  return { ...parsed, model, refused: false };
}
