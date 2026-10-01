import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// The ONLY place the Anthropic API key is read. It comes from the server's
// environment (.env.local) and is never sent to the browser.

let client: Anthropic | null | undefined;

/** Returns the AI client, or null when no API key is set (the app then runs in demo mode). */
export function getAI(): Anthropic | null {
  if (client !== undefined) return client;
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  client = key ? new Anthropic({ apiKey: key, maxRetries: 2, timeout: 120_000 }) : null;
  return client;
}

export function aiEnabled(): boolean {
  return getAI() !== null;
}

/** Model used for each feature. Change in .env without touching code. */
export const MODELS = {
  finder: process.env.AI_MODEL_FINDER || process.env.AI_MODEL || "claude-opus-5-5",
  coach: process.env.AI_MODEL_COACH || process.env.AI_MODEL || "claude-opus-5-5",
  tasks: process.env.AI_MODEL_TASKS || process.env.AI_MODEL || "claude-opus-5-5",
};

type Effort = "low" | "medium" | "high";
export const EFFORT = {
  finder: (process.env.AI_EFFORT_FINDER as Effort) || "medium",
  coach: (process.env.AI_EFFORT_COACH as Effort) || "low",
  tasks: (process.env.AI_EFFORT_TASKS as Effort) || "low",
};

// Approximate prices in US dollars per 1 million tokens (input, output).
// Used only to estimate spending for the daily budget cap.
const PRICES: Record<string, [number, number]> = {
  "claude-fable-5-1": [10, 50],
  "claude-opus-5-5": [4, 20],
  "claude-opus-5": [5, 25],
  "claude-sonnet-5-5": [2, 10],
  "claude-sonnet-5": [2, 10],
  "claude-haiku-4-5": [1, 5],
};
const WEB_SEARCH_PRICE = 0.01; // $10 per 1,000 searches

export interface UsageLike {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  server_tool_use?: { web_search_requests?: number | null; web_fetch_requests?: number | null } | null;
}

/** Estimated cost in cents of one AI call. */
export function estimateCostCents(model: string, usage: UsageLike): { cents: number; searches: number } {
  const [inP, outP] = PRICES[model] ?? [5, 25];
  const input =
    (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) * 1.25 + (usage.cache_read_input_tokens ?? 0) * 0.1;
  const searches = usage.server_tool_use?.web_search_requests ?? 0;
  const dollars = (input * inP + (usage.output_tokens ?? 0) * outP) / 1_000_000 + searches * WEB_SEARCH_PRICE;
  return { cents: dollars * 100, searches };
}

/** Add up usage from several API responses (for multi-step calls). */
export function addUsage(a: UsageLike, b: UsageLike): UsageLike {
  return {
    input_tokens: (a.input_tokens ?? 0) + (b.input_tokens ?? 0),
    output_tokens: (a.output_tokens ?? 0) + (b.output_tokens ?? 0),
    cache_read_input_tokens: (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
    cache_creation_input_tokens: (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    server_tool_use: {
      web_search_requests: (a.server_tool_use?.web_search_requests ?? 0) + (b.server_tool_use?.web_search_requests ?? 0),
      web_fetch_requests: (a.server_tool_use?.web_fetch_requests ?? 0) + (b.server_tool_use?.web_fetch_requests ?? 0),
    },
  };
}
