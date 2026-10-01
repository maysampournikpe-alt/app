import type { z } from "zod";
import type { ProfileSummary } from "@/types";

/** One kind of AI job that returns structured JSON (a plan, flashcards, a resume...). */
export interface TaskDef<I, O> {
  input: z.ZodType<I>;
  /** JSON shape the AI must return (kept simple: strings, numbers, enums, arrays). */
  output: z.ZodType<O>;
  system: string;
  prompt: (input: I, ctx: { locale: string; profile: ProfileSummary; today: string }) => string;
  /** Answer used in demo mode (no API key) or when the daily limit is reached. */
  demo: (input: I, ctx: { locale: string; profile: ProfileSummary }) => O;
  /** Text to scan for safety problems before calling the AI. */
  textForSafety: (input: I) => string;
  maxTokens?: number;
}

export const LANG_NAMES: Record<string, string> = { en: "English", es: "Spanish (simple, friendly, Latin American)", vi: "Vietnamese" };
