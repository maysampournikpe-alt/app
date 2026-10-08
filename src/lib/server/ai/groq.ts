import "server-only";

// Optional second AI provider: Groq (https://groq.com), which has a free plan.
// Used for the Coach and for plans/flashcards/resume/speaking tips when no Anthropic key is set.
// NOT used for opportunity search: search must check every listing's link on the live web,
// which needs Claude's web search tools. Without Anthropic, search uses the hand-checked sample list.
// The key is read only here, on the server, from GROQ_API_KEY — never sent to the browser.

const URL = `${process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"}/chat/completions`;
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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
  const res = await fetch(URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: 0.4,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Streams the answer as plain text pieces. */
export async function* groqStream(messages: ChatMsg[], maxTokens = 2048): AsyncGenerator<string> {
  const res = await fetch(URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: maxTokens, temperature: 0.5, stream: true }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok || !res.body) throw new Error(`Groq HTTP ${res.status}`);
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
