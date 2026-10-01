import "server-only";
import { z } from "zod";
import type { TaskDef } from "./types";
import { LANG_NAMES } from "./types";

// 4.3 Flashcard maker: the AI turns a student's notes into question/answer cards.

const Input = z.object({ notes: z.string().trim().min(10).max(8000) });
const Output = z.object({ cards: z.array(z.object({ front: z.string(), back: z.string() })) });

/** Lines like "term - definition" or "term: definition" become cards (used in demo mode and as a backup). */
export function cardsFromLines(notes: string) {
  return notes
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-*•\d.)]+\s*/, "").trim())
    .map((l) => /^(.{2,80}?)\s*(?:\s[-–—]\s|:|=)\s*(.{2,300})$/.exec(l))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ front: m[1].trim(), back: m[2].trim() }))
    .slice(0, 40);
}

export const flashcardsTask: TaskDef<z.infer<typeof Input>, z.infer<typeof Output>> = {
  input: Input,
  output: Output,
  system: `You turn a middle or high school student's study notes into 5-25 flashcards for Rumbo, a student app.
Each card: "front" is a short question or term; "back" is a short, correct answer (under 30 words).
Use ONLY information in the notes — don't add new facts. Cover the most important ideas. Write in the same language as the notes unless asked otherwise.`,
  prompt: (i, ctx) => `Language for the cards: same as the notes (app language: ${LANG_NAMES[ctx.locale] ?? "English"}).\n\nNotes:\n"""${i.notes}"""`,
  demo: (i) => ({ cards: cardsFromLines(i.notes) }),
  textForSafety: (i) => i.notes,
};
