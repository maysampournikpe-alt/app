import "server-only";
import { z } from "zod";
import type { TaskDef } from "./types";
import { LANG_NAMES } from "./types";

// 2.4.1 Resume builder: turn the student's OWN tracker entries into resume bullet points.

const Input = z.object({
  entries: z.array(z.object({ id: z.string().max(40), kind: z.enum(["accomplishment", "volunteer", "certificate", "activity"]), text: z.string().max(600) })).min(1).max(40),
});
const Output = z.object({ items: z.array(z.object({ id: z.string(), bullet: z.string() })) });

const SYSTEM = `You help middle and high school students write resume bullet points in Rumbo, a student app.
For each entry, write ONE concise bullet (under 22 words) that starts with a strong action verb (Led, Organized, Volunteered, Earned, Built, Tutored...).
STRICT: use only facts in the entry. Never add numbers, results, skills, titles, or details that aren't there. If the entry is short, keep the bullet short. Return every id exactly once.
Write in the requested language. Plain text, no bullet symbols.`;

export const resumeTask: TaskDef<z.infer<typeof Input>, z.infer<typeof Output>> = {
  input: Input,
  output: Output,
  system: SYSTEM,
  prompt: (i, ctx) => `Language: ${LANG_NAMES[ctx.locale] ?? "English"}\nEntries:\n${i.entries.map((e) => `- id=${e.id} (${e.kind}): ${e.text}`).join("\n")}`,
  // Demo: tidy the text without inventing anything.
  demo: (i) => ({
    items: i.entries.map((e) => {
      const t = e.text.replace(/\s+/g, " ").trim().replace(/[.]+$/, "");
      return { id: e.id, bullet: t.charAt(0).toUpperCase() + t.slice(1) };
    }),
  }),
  textForSafety: (i) => i.entries.map((e) => e.text).join(" "),
};
