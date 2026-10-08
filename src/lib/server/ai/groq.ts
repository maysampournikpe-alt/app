import "server-only";

// Optional second AI provider: Groq (https://groq.com), which has a free plan.
// Used for the Coach and for plans/flashcards/resume/speaking tips when no Anthropic key is set.
// NOT used for opportunity search: search must check every listing's link on the live web,
// which needs Claude's web search tools. Without Anthropic, search uses the hand-checked sample list.
// The key is read only here, on the server, from GROQ_API_KEY — never sent to the browser.

const URL = `${process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"}/chat/completions`;
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
/** Groq retires models from time to time; if one is gone, try the next. */
const MODELS = [...new Set([GROQ_MODEL, "openai/gpt-oss-120b", "llama-3.3-70b-versatile", "openai/gpt-oss-20b", "llama-3.1-8b-instant"])];
let working: string | undefined;

/** POST to Groq, trying fallback models when a model isn't available (400/404). Auth errors (401/403) stop right away. */
async function post(body: Record<string, unknown>, timeoutMs: number): Promise<Response> {
  const order = working ? [working, ...MODELS.filter((m) => m !== working)] : MODELS;
  let last = "";
  for (const model of order) {
    const res = await fetch(URL, { method: "POST", headers: headers(), body: JSON.stringify({ ...body, model }), signal: AbortSignal.timeout(timeoutMs) });
    if (res.ok) {
      working = model;
      return res;
    }
    last = `Groq HTTP ${res.status} (${model}): ${(await res.text()).slice(0, 300)}`;
    console.error(last);
    if (res.status === 401 || res.status === 403 || res.status === 429) break;
  }
  throw new Error(last);
}

export function groqEnabled(): boolean {
  return !!process.env.GROQ_API_KEY?.trim();
}

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

function headers() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}` };
}

/** One answer, optionally forced to be a JSON object. */
export async function groqComplete(messages: ChatMsg[], opts: { json?: boolean; maxTokens?: number } = {}): Promise<string> {
  const res = await post({ messages, max_tokens: opts.maxTokens ?? 4096, temperature: 0.4, ...(opts.json ? { response_format: { type: "json_object" } } : {}) }, 60_000);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Streams the answer as plain text pieces. */
export async function* groqStream(messages: ChatMsg[], maxTokens = 2048): AsyncGenerator<string> {
  const res = await post({ messages, max_tokens: maxTokens, temperature: 0.5, stream: true }, 90_000);
  if (!res.body) throw new Error("Groq: empty response");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const piece = (JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
        if (piece) yield piece;
      } catch {
        /* ignore partial lines */
      }
    }
  }
}

/** Full reply message (including Groq's record of the web searches it ran). Used by search. */
export async function groqMessage(messages: ChatMsg[], models: string[], maxTokens = 6000): Promise<{ content: string; raw: unknown; model: string }> {
  let last = "";
  for (const model of models) {
    const res = await fetch(URL, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.2 }),
      signal: AbortSignal.timeout(90_000),
    });
    if (res.ok) {
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const msg = data.choices?.[0]?.message;
      return { content: msg?.content ?? "", raw: msg, model };
    }
    last = `Groq HTTP ${res.status} (${model}): ${(await res.text()).slice(0, 300)}`;
    console.error(last);
    if (res.status === 401 || res.status === 403 || res.status === 429) break;
  }
  throw new Error(last);
}
