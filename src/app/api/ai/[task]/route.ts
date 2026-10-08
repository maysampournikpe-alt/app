import { NextResponse } from "next/server";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getAI, aiEnabled, MODELS, EFFORT, estimateCostCents, type UsageLike } from "@/lib/server/ai/client";
import { groqEnabled, groqComplete } from "@/lib/server/ai/groq";
import { z as zod } from "zod";
import { checkLimits, recordUsage } from "@/lib/server/ratelimit";
import { TASKS } from "@/lib/server/tasks";
import { detectCrisis, isBlockedRequest } from "@/lib/safety/crisis";

// POST /api/ai/<task> — AI tools that return structured data (plans, flashcards, resume...).

const Envelope = z.object({
  input: z.unknown(),
  locale: z.string().max(5).default("en"),
  profile: z
    .object({
      grade: z.number().int().optional(),
      age: z.number().int().optional(),
      interests: z.array(z.string().max(40)).max(12).optional(),
      goals: z.array(z.string().max(120)).max(6).optional(),
      transport: z.enum(["car", "rides", "bus_walk", "unknown"]).optional(),
      firstGen: z.boolean().optional(),
    })
    .default({}),
});

export async function POST(req: Request, ctx: { params: Promise<{ task: string }> }) {
  const { task: name } = await ctx.params;
  const task = TASKS[name];
  if (!task) return NextResponse.json({ error: "unknown_task" }, { status: 404 });

  let env: z.infer<typeof Envelope>;
  let input: unknown;
  try {
    env = Envelope.parse(await req.json());
    input = task.input.parse(env.input);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const c = { locale: env.locale, profile: env.profile, today: new Date().toISOString().slice(0, 10) };

  const safetyText = task.textForSafety(input);
  const crisis = detectCrisis(safetyText);
  if (crisis) return NextResponse.json({ crisis });
  if (isBlockedRequest(safetyText)) return NextResponse.json({ blocked: true });

  if (!aiEnabled() && !groqEnabled()) return NextResponse.json({ output: task.demo(input, c), demo: true });
  const limit = await checkLimits(req, "task");
  if (!limit.ok) return NextResponse.json({ output: task.demo(input, c), demo: true, notice: limit.reason });

  // Free option: Groq (only when there is no Anthropic key). The answer must match the same
  // JSON shape; if it doesn't, the student gets the built-in demo answer instead.
  if (!aiEnabled()) {
    try {
      const schema = JSON.stringify(zod.toJSONSchema(task.output));
      const text = await groqComplete(
        [
          { role: "system", content: `${task.system}\n\nReply with ONLY one JSON object that matches this JSON Schema:\n${schema}` },
          { role: "user", content: task.prompt(input, c) },
        ],
        { json: true, maxTokens: task.maxTokens ?? 6000 },
      );
      await recordUsage(req, "task", { inputTokens: 0, outputTokens: 0, searches: 0, costCents: 0 });
      const checked = task.output.safeParse(JSON.parse(text));
      if (checked.success) return NextResponse.json({ output: checked.data, demo: false });
    } catch (e) {
      console.error(`task ${name} Groq error`, e);
    }
    return NextResponse.json({ output: task.demo(input, c), demo: true, notice: "error" });
  }

  try {
    const ai = getAI()!;
    const res = await ai.beta.messages.parse({
      model: MODELS.tasks,
      max_tokens: task.maxTokens ?? 8000,
      system: [{ type: "text", text: task.system, cache_control: { type: "ephemeral" } }],
      output_config: { effort: EFFORT.tasks, format: betaZodOutputFormat(task.output) },
      messages: [{ role: "user", content: task.prompt(input, c) }],
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    const usage = res.usage as UsageLike;
    const cost = estimateCostCents(res.model, usage);
    await recordUsage(req, "task", { inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0, searches: 0, costCents: cost.cents });
    if (res.stop_reason === "refusal" || !res.parsed_output) return NextResponse.json({ output: task.demo(input, c), demo: true, notice: "error" });
    const checked = task.output.safeParse(res.parsed_output);
    if (!checked.success) return NextResponse.json({ output: task.demo(input, c), demo: true, notice: "error" });
    return NextResponse.json({ output: checked.data, demo: false });
  } catch (e) {
    console.error(`task ${name} error`, e);
    return NextResponse.json({ output: task.demo(input, c), demo: true, notice: "error" });
  }
}
