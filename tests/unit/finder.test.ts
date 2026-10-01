import { describe, it, expect } from "vitest";
import { normalizeUrl, urlsFromResponse, isVerifiedUrl } from "@/lib/server/finder/verify";
import { parseFinderAnswer, extractJson } from "@/lib/server/finder/ai";
import { demoSearch } from "@/lib/server/finder/demo";

// A fake AI response: one search result block + the AI's JSON answer.
const content = [
  {
    type: "web_search_tool_result",
    tool_use_id: "x",
    content: [
      { type: "web_search_result", url: "https://www.example.org/teen-volunteers/?utm_source=x", title: "Teen volunteers" },
      { type: "web_search_result", url: "https://library.example.gov/teens", title: "Library" },
    ],
  },
  { type: "text", text: "<json>...</json>", citations: [{ url: "https://cited.example.com/page" }] },
];

describe("source link verification (the AI can't invent listings)", () => {
  const known = urlsFromResponse(content);
  it("collects URLs from search results and citations", () => {
    expect(known.has("example.org/teen-volunteers")).toBe(true);
    expect(known.has("library.example.gov/teens")).toBe(true);
    expect(known.has("cited.example.com/page")).toBe(true);
  });
  it("ignores small URL differences", () => {
    expect(normalizeUrl("https://WWW.Example.org/teen-volunteers/#top")).toBe("example.org/teen-volunteers");
    expect(isVerifiedUrl("http://example.org/teen-volunteers", known)).toBe(true);
  });
  it("rejects links that were not in the search results", () => {
    expect(isVerifiedUrl("https://made-up-program.org/apply", known)).toBe(false);
    expect(isVerifiedUrl("https://example.org/other-page", known)).toBe(false);
    expect(isVerifiedUrl(undefined, known)).toBe(false);
  });

  it("removes invented listings from the AI's answer and keeps real ones", () => {
    const answer = `Here you go <json>${JSON.stringify({
      message: "Found 1",
      results: [
        { title: "Teen Volunteer Program", organization: "Example Org", description: "Help out", category: "volunteer opportunity", costType: "free", sourceUrl: "https://www.example.org/teen-volunteers/", mode: "in_person", city: "McAllen, TX", deadline: "2026-11-01", gradeMin: 9, ageMin: null },
        { title: "Fake Internship", organization: "Nowhere Inc", description: "Not real", category: "internship", sourceUrl: "https://nowhere-inc.com/intern" },
        { title: "No link", organization: "X", category: "job" },
      ],
      suggestions: [{ name: "Legal aid office", kind: "Nonprofit", why: "May need volunteers", website: "https://invented.org", emailScript: "Hello", phoneScript: "Hi" }],
    })}</json>`;
    const out = parseFinderAnswer(answer, known, { locale: "en", topic: "law" });
    expect(out.results).toHaveLength(1);
    expect(out.removed).toBe(2);
    expect(out.results[0].category).toBe("volunteer");
    expect(out.results[0].cost.type).toBe("free");
    expect(out.results[0].ages).toBeUndefined();
    expect(out.results[0].grades?.min).toBe(9);
    // Suggestion is kept (it's labeled "not confirmed") but its unverified website is hidden.
    expect(out.suggestions).toHaveLength(1);
    expect(out.suggestions[0].website).toBeUndefined();
  });

  it("survives broken AI output", () => {
    expect(extractJson("no json here")).toBeNull();
    expect(parseFinderAnswer("garbage", known, { locale: "en", topic: "x" }).results).toEqual([]);
  });
});

describe("demo search", () => {
  it("finds chess competitions", () => {
    const r = demoSearch({ query: "middle school chess competitions", locale: "en", profile: { grade: 7 } });
    expect(r.results[0].id).toBe("demo-tx-chess");
  });
  it("works in Spanish and returns Spanish text", () => {
    const r = demoSearch({ query: "becas para la universidad", locale: "es", profile: {} });
    expect(r.results.some((o) => o.category === "scholarship")).toBe(true);
    expect(r.results[0].description).toMatch(/[áéíóúñ]|beca|universidad/i);
  });
  it("gives suggestions with email and phone scripts for law internships", () => {
    const r = demoSearch({ query: "law internships for high schoolers", locale: "en", profile: { grade: 11 } });
    expect(r.suggestions.length).toBeGreaterThanOrEqual(3);
    expect(r.suggestions[0].emailScript).toContain("[your first name]");
    expect(r.suggestions.map((s) => s.name).join(" ")).toMatch(/courthouse|law firms|legal aid/i);
  });
  it("shows the scam-practice example only for job searches", () => {
    expect(demoSearch({ query: "jobs from home", locale: "en", profile: {} }).results.some((o) => o.id === "demo-scam-example")).toBe(true);
    expect(demoSearch({ query: "coding camps", locale: "en", profile: {} }).results.some((o) => o.id === "demo-scam-example")).toBe(false);
  });
});
