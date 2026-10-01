// "The AI must NEVER invent listings" — enforced in code.
// We collect every URL the web search tool actually returned during the request,
// then throw away any listing whose source link is not one of them.

/** Normalize a URL so small differences (www, trailing slash, tracking tags) don't matter. */
export function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref$|source$)/i.test(k)) u.searchParams.delete(k);
    }
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "") || "";
    const q = u.searchParams.toString();
    return `${host}${path}${q ? `?${q}` : ""}`.toLowerCase();
  } catch {
    return null;
  }
}

/** Walk any JSON value and collect every string found under a "url" key. */
export function collectUrls(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, out);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if ((k === "url" || k === "source_url") && typeof v === "string") {
        const n = normalizeUrl(v);
        if (n) out.add(n);
      } else {
        collectUrls(v, out);
      }
    }
  }
  return out;
}

/**
 * Collect URLs from the AI response: search results, fetched pages, and citations.
 * The AI's own JSON answer (a text block) is NOT a source, so text is skipped
 * except for its citation objects.
 */
export function urlsFromResponse(content: unknown[]): Set<string> {
  const out = new Set<string>();
  for (const block of content) {
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    if (b.type === "text") {
      collectUrls(b.citations, out);
    } else if (typeof b.type === "string" && (b.type.endsWith("_tool_result") || b.type.endsWith("tool_result"))) {
      collectUrls(b.content, out);
    }
  }
  return out;
}

/** Is this source link one the search really returned? */
export function isVerifiedUrl(url: string | undefined, known: Set<string>): boolean {
  if (!url) return false;
  const n = normalizeUrl(url);
  if (!n) return false;
  if (known.has(n)) return true;
  // Accept the same page with or without query string.
  const noQuery = n.split("?")[0];
  for (const k of known) if (k.split("?")[0] === noQuery) return true;
  return false;
}
