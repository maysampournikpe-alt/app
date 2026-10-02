import "server-only";
import { z } from "zod";
import type { TaskDef } from "./types";
import { LANG_NAMES } from "./types";

// 4.5 Public speaking coach: short, kind, specific tips on a practice speech transcript.

const Input = z.object({
  topic: z.string().max(200).optional(),
  transcript: z.string().trim().min(5).max(6000),
  seconds: z.number().min(1).max(600),
  wpm: z.number().min(0).max(400),
  fillers: z.number().int().min(0).max(500),
});
const Output = z.object({ strength: z.string(), tips: z.array(z.string()) });

export const speakingTask: TaskDef<z.infer<typeof Input>, z.infer<typeof Output>> = {
  input: Input,
  output: Output,
  system: `You are a friendly public speaking coach for middle and high school students in Rumbo, a student app.
Given a transcript of a short practice speech (from speech-to-text, so ignore small transcription errors) and simple stats, reply with:
- "strength": one specific thing they did well (one sentence)
- "tips": 3 short, specific, encouraging tips (structure, clarity, examples, opening, closing, pace, filler words).
Quote a few of their words when helpful. Never mock them. Write in the requested language.`,
  prompt: (i, ctx) =>
    `Language: ${LANG_NAMES[ctx.locale] ?? "English"}\nTopic: ${i.topic ?? "(student's choice)"}\nLength: ${Math.round(i.seconds)} seconds, ${i.wpm} words per minute, ${i.fillers} filler words.\nTranscript:\n"""${i.transcript}"""`,
  demo: (i, ctx) => {
    const es = ctx.locale === "es";
    const tips: string[] = [];
    if (i.wpm > 170) tips.push(es ? "Habla un poco más despacio y haz una pausa después de cada idea." : "Slow down a little and pause after each main idea.");
    if (i.wpm > 0 && i.wpm < 110) tips.push(es ? "Practica tus ideas principales para que las palabras salgan con más fluidez." : "Practice your main points so the words flow more easily.");
    if (i.fillers >= 3) tips.push(es ? "Cambia las muletillas por una pausa corta. El silencio suena seguro." : "Swap filler words for a short pause. Silence sounds confident.");
    tips.push(es ? "Empieza con una pregunta o una historia corta para captar la atención." : "Open with a question or a short story to grab attention.");
    tips.push(es ? "Termina con una frase fuerte que resuma tu idea principal." : "End with one strong sentence that sums up your main idea.");
    return {
      strength: es ? "¡Te animaste a practicar en voz alta — ese es el paso más importante!" : "You practiced out loud — that's the most important step!",
      tips: tips.slice(0, 3),
    };
  },
  textForSafety: (i) => i.transcript,
};
