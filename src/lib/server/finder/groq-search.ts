import "server-only";
import { groqMessage, groqComplete } from "../ai/groq";
import type { ResolvedLocation } from "../geo";
import type { FinderRequest } from "./types";
import { SYSTEM, parseFinderAnswer, requestLines } from "./ai";
import { collectUrls, normalizeUrl } from "./verify";
import { extractJson } from "./ai";

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

/**
 * Is this page real and online right now? Used for links that are close to, but not exactly,
 * a search result (e.g. a different page on the same site). The server opens the page itself.
 */
export async function linkIsLive(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const res = await fetch(u, { method: "GET", redirect: "follow", headers: { "User-Agent": "RumboLinkCheck/1.0" }, signal: AbortSignal.timeout(6000) });
    void res.body?.cancel();
    return res.status < 400;
  } catch {
    return false;
  }
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

export async function groqSearch(req: FinderRequest, where: ResolvedLocation | null) {
  const lines = requestLines(req, where);
  const { content, raw, model } = await groqMessage(
    [
      { role: "system", content: SYSTEM },
      { role: "user", content: `${lines.join("\n")}\n\nSearch the web now (do several searches with different words). Only list opportunities whose page you found in your search results, and use that exact page URL as sourceUrl. End with the JSON inside <json></json> tags.` },
    ],
    SEARCH_MODELS,
  );
  const known = urlsFromGroq(raw);

  // If the searcher answered in normal text instead of JSON, have a second model turn it into JSON.
  // (It may only reshape what was found; links are still checked below.)
  let answer = content;
  if (!extractJson(content)) {
    answer = await groqComplete(
      [
        { role: "system", content: `${SYSTEM}\n\nYou are now only REFORMATTING notes from a web search into the JSON format. Do not add any opportunity or link that is not in the notes.` },
        { role: "user", content: `Web search notes:\n"""${content.slice(0, 12000)}"""\n\nReturn the JSON object only.` },
      ],
      { json: true, maxTokens: 6000 },
    ).catch(() => "");
  }

  // Links on a site the search really visited get a live check instead of an exact-match check.
  const knownHosts = new Set([...known].map((k) => k.split("/")[0]));
  const json = extractJson(answer) as { results?: { sourceUrl?: string }[] } | null;
  const nearMisses = (json?.results ?? []).map((r) => r?.sourceUrl).filter((u): u is string => !!u && !known.has(normalizeUrl(u) ?? "") && knownHosts.has(hostOf(u)));
  const live = await Promise.all(nearMisses.slice(0, 8).map(async (u) => ((await linkIsLive(u)) ? normalizeUrl(u) : null)));
  for (const n of live) if (n) known.add(n);

  const parsed = parseFinderAnswer(answer, known, { locale: req.locale, topic: req.query.slice(0, 60), grade: req.profile.grade });
  if (!parsed.results.length) console.error(`finder Groq: 0 results kept (removed ${parsed.removed}, search links ${known.size}, model ${model})`);
  return { ...parsed, model, refused: false };
}
