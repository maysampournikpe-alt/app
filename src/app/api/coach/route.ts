import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAI, aiEnabled, MODELS, EFFORT, estimateCostCents, type UsageLike } from "@/lib/server/ai/client";
import { groqEnabled, groqStream } from "@/lib/server/ai/groq";
import { checkLimits, recordUsage } from "@/lib/server/ratelimit";
import { coachSystemPrompt, studentContext } from "@/lib/server/coach/prompts";
import { demoCoachReply } from "@/lib/server/coach/demo";
import { detectCrisis, isBlockedRequest } from "@/lib/safety/crisis";

// POST /api/coach — the AI Coach chat. Streams the reply word by word.
// Special headers tell the app about safety events:
//   x-rumbo-crisis: the student may be in danger → the app shows help lines
//   x-rumbo-demo:   demo reply (no AI key, or daily limit reached)

const Body = z.object({
  mode: z.enum(["ask", "homework", "interview", "debate", "quiz", "email", "essay", "language"]),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(12000) }))
    .min(1)
    .max(60),
  locale: z.string().max(5).default("en"),
  profile: z
    .object({
      grade: z.number().int().optional(),
      age: z.number().int().optional(),
      interests: z.array(z.string().max(40)).max(12).optional(),
      goals: z.array(z.string().max(120)).max(6).optional(),
      firstGen: z.boolean().optional(),
    })
    .default({}),
  opp: z.object({ title: z.string().max(200), organization: z.string().max(120).optional(), category: z.string().max(40).optional(), description: z.string().max(600).optional() }).optional(),
});

function textStream(text: string, headers: Record<string, string> = {}) {
  const enc = new TextEncoder();
  const words = text.split(/(\s+)/);
  const stream = new ReadableStream({
    async start(controller) {
      // Send in small pieces so demo replies "type" like the real AI.
      for (let i = 0; i < words.length; i += 6) {
        controller.enqueue(enc.encode(words.slice(i, i + 6).join("")));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}

const CRISIS_REPLY: Record<string, string> = {
  en: "I'm really glad you told me. What you're feeling matters, and you deserve support right now. You can call or text 988 any time (press 2 for Spanish), or text HOME to 741741. If you're in danger right now, call 911. Please also tell a trusted adult or your school counselor today. The buttons below connect you right away.",
  es: "Me alegra mucho que me lo dijeras. Lo que sientes importa y mereces apoyo ahora mismo. Puedes llamar o mandar texto al 988 a cualquier hora (marca 2 para español), o textear AYUDA al 741741. Si estás en peligro ahora, llama al 911. Por favor, cuéntale hoy también a un adulto de confianza o a tu consejero escolar. Los botones de abajo te conectan de inmediato.",
};
const BLOCKED_REPLY: Record<string, string> = {
  en: "I can't help with that one. Let's work on something that moves you toward your goals — homework, a plan, practice for an interview, or finding an opportunity. What would you like to do?",
  es: "No puedo ayudar con eso. Trabajemos en algo que te acerque a tus metas — tarea, un plan, practicar una entrevista o encontrar una oportunidad. ¿Qué te gustaría hacer?",
};
const REFUSAL_REPLY: Record<string, string> = {
  en: "\n\nI can't continue with that. If something serious is going on, please talk to a trusted adult or your school counselor.",
  es: "\n\nNo puedo seguir con eso. Si está pasando algo serio, habla con un adulto de confianza o con tu consejero escolar.",
};

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const loc = body.locale === "es" ? "es" : "en";
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.text ?? "";

  // 1. Safety checks happen BEFORE any AI call.
  const crisis = detectCrisis(lastUser);
  if (crisis) return textStream(CRISIS_REPLY[loc], { "x-rumbo-crisis": crisis });
  if (isBlockedRequest(lastUser)) return textStream(BLOCKED_REPLY[loc], { "x-rumbo-blocked": "1" });

  // 2. Demo mode (no key) or daily limit reached → scripted coach.
  if (!aiEnabled() && !groqEnabled()) return textStream(demoCoachReply(body.mode, body.messages, body.locale, body.opp), { "x-rumbo-demo": "1" });
  const limit = await checkLimits(req, "coach");
  if (!limit.ok) return textStream(demoCoachReply(body.mode, body.messages, body.locale, body.opp), { "x-rumbo-demo": "1", "x-rumbo-notice": limit.reason });

  // 3. Real AI. Keep only recent messages to control cost.
  const recent = body.messages.slice(-16);
  const context = studentContext(body.profile, body.opp);
  const messages: Anthropic.Beta.Messages.BetaMessageParam[] = recent.map((m, i) => ({
    role: m.role,
    content: i === 0 && m.role === "user" && context ? `${context}\n\n${m.text}` : m.text,
  }));
  if (messages[0]?.role !== "user") messages.unshift({ role: "user", content: context || "Hi!" });

  const enc = new TextEncoder();

  // Free option: Groq (only when there is no Anthropic key). Same safety checks and limits as above.
  if (!aiEnabled()) {
    const groqMessages = [
      { role: "system" as const, content: coachSystemPrompt(body.mode, body.locale) },
      ...messages.map((m) => ({ role: m.role, content: String(m.content) })),
    ];
    const gStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const piece of groqStream(groqMessages)) controller.enqueue(enc.encode(piece));
          await recordUsage(req, "coach", { inputTokens: 0, outputTokens: 0, searches: 0, costCents: 0 }).catch(() => {});
        } catch (e) {
          console.error("coach Groq error", e);
          controller.enqueue(enc.encode(loc === "es" ? "\n\n(Hubo un problema con la IA. Intenta de nuevo.)" : "\n\n(The AI had a problem. Please try again.)"));
        }
        controller.close();
      },
    });
    return new Response(gStream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }

  const ai = getAI()!;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = ai.beta.messages.stream({
          model: MODELS.coach,
          max_tokens: 4096,
          system: [{ type: "text", text: coachSystemPrompt(body.mode, body.locale), cache_control: { type: "ephemeral" } }],
          output_config: { effort: EFFORT.coach },
          messages,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") controller.enqueue(enc.encode(ev.delta.text));
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(enc.encode(REFUSAL_REPLY[loc]));
        const usage = final.usage as UsageLike;
        const cost = estimateCostCents(final.model, usage);
        await recordUsage(req, "coach", { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0, searches: 0, costCents: cost.cents }).catch(() => {});
      } catch (e) {
        console.error("coach AI error", e);
        controller.enqueue(enc.encode(loc === "es" ? "\n\n(Hubo un problema con la IA. Intenta de nuevo.)" : "\n\n(The AI had a problem. Please try again.)"));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
