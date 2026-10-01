import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAI, addUsage, type UsageLike } from "./client";

type CreateParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;
type Block = Anthropic.Beta.Messages.BetaContentBlock;

export interface RunResult {
  content: Block[];
  text: string;
  usage: UsageLike;
  stopReason: string | null;
  model: string;
}

/**
 * Calls Claude and keeps going if a long web-search turn pauses ("pause_turn").
 * Uses server-side fallbacks so a request that one model declines can be
 * handled by another model automatically.
 */
export async function runClaude(params: Omit<CreateParams, "betas" | "fallbacks">, maxContinuations = 3): Promise<RunResult> {
  const ai = getAI();
  if (!ai) throw new Error("AI not configured");
  const messages = [...params.messages];
  const content: Block[] = [];
  let usage: UsageLike = {};
  let stopReason: string | null = null;
  let model = params.model;

  for (let i = 0; i <= maxContinuations; i++) {
    const res = await ai.beta.messages.create({
      ...params,
      messages,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    content.push(...res.content);
    usage = addUsage(usage, res.usage as UsageLike);
    stopReason = res.stop_reason;
    model = res.model;
    if (res.stop_reason !== "pause_turn") break;
    // The server paused a long tool turn: send it back and it resumes where it left off.
    messages.push({ role: "assistant", content: res.content });
  }

  const text = content
    .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return { content, text, usage, stopReason, model };
}
