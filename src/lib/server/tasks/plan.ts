import "server-only";
import { z } from "zod";
import { GOAL_TEMPLATES } from "@/data/goal-templates";
import { pickLocalized } from "@/i18n/translate";
import type { TaskDef } from "./types";
import { LANG_NAMES } from "./types";

// 1.3 Plan Builder: the AI turns a goal into weekly, monthly and yearly steps.

import { PlanOutput, type PlanOutputT } from "./plan-types";

const SYSTEM = `You create realistic, encouraging step-by-step plans for middle and high school students (ages 11-18) in Rumbo, a student opportunity app. Many students live in the Rio Grande Valley of Texas and have limited money and transportation.

Rules:
- Make 4-6 "week" steps (things to do in the next 7 days), 4-6 "month" steps (next 1-3 months) and 3-5 "year" steps (this school year and beyond).
- Fit the student's grade and available hours per week. Keep each step small and concrete (start with a verb).
- Prefer free or low-cost actions, online options, and things at school.
- Do NOT invent specific programs, dates, prices, or websites. Describe types of opportunities instead.
- For 3-5 steps where finding an opportunity would help, set "searchQuery" to a short search the student can run in Rumbo's Find tab (e.g. "hospital volunteer program for teens"). Otherwise null.
- "detail" is one short helpful sentence (can be empty).
- Write all text in the requested language.
- Avoid anything unsafe or inappropriate for minors.`;

const ADJUST_SYSTEM = `${SYSTEM}

You are ADJUSTING an existing plan based on the student's request. Keep every step marked done:true exactly as it is (same title, done:true). Change, remove, or add the other steps to match the request. Return the full updated plan.`;

const CreateInput = z.object({ goal: z.string().trim().min(2).max(200), grade: z.number().int().min(1).max(12).optional(), hoursPerWeek: z.number().min(0.5).max(60).optional() });
const AdjustInput = z.object({
  goal: z.string().max(200),
  request: z.string().trim().min(2).max(500),
  hoursPerWeek: z.number().min(0.5).max(60).optional(),
  milestones: z.array(z.object({ title: z.string().max(300), horizon: z.enum(["week", "month", "year"]), done: z.boolean() })).max(40),
});

/** Demo: use a matching hand-written template, or a sensible generic plan. */
export function demoPlan(goal: string, locale: string): PlanOutputT {
  const tpl = GOAL_TEMPLATES.find((t) => t.match.test(goal));
  if (tpl) {
    return {
      summary: pickLocalized(tpl.summary, locale),
      milestones: tpl.steps.map((s) => ({ title: pickLocalized(s.t, locale), detail: s.d ? pickLocalized(s.d, locale) : "", horizon: s.h, searchQuery: s.q ? pickLocalized(s.q, locale) : null, done: false })),
    };
  }
  const es = locale === "es";
  const g = goal.trim();
  const m = (h: "week" | "month" | "year", en: string, sp: string, q: string | null = null) => ({ title: es ? sp : en, detail: "", horizon: h, searchQuery: q, done: false });
  return {
    summary: es ? `Un plan paso a paso para: ${g}. Empieza pequeño y avanza cada semana.` : `A step-by-step plan for: ${g}. Start small and make progress every week.`,
    milestones: [
      m("week", `Write down why "${g}" matters to you`, `Escribe por qué “${g}” es importante para ti`),
      m("week", "Talk to a teacher, counselor or coach about this goal", "Habla con un maestro, consejero o entrenador sobre esta meta"),
      m("week", "Find one free resource to start learning (video, book, or course)", "Busca un recurso gratis para empezar (video, libro o curso)", g),
      m("week", "Block 2 short work sessions in your week", "Aparta 2 sesiones cortas de trabajo en tu semana"),
      m("month", "Find a club, class or program connected to this goal", "Busca un club, clase o programa relacionado con esta meta", `${g} program for teens`),
      m("month", "Practice every week and track your progress", "Practica cada semana y lleva un registro de tu progreso"),
      m("month", "Meet someone who already does this and ask them questions", "Conoce a alguien que ya hace esto y hazle preguntas"),
      m("year", "Enter a competition, event or volunteer role related to your goal", "Participa en una competencia, evento o voluntariado relacionado con tu meta", `${g} competition`),
      m("year", "Look back at your progress and set your next goal", "Revisa tu progreso y ponte la siguiente meta"),
    ],
  };
}

export const planCreate: TaskDef<z.infer<typeof CreateInput>, PlanOutputT> = {
  input: CreateInput,
  output: PlanOutput,
  system: SYSTEM,
  prompt: (i, ctx) =>
    [
      `Goal: ${i.goal}`,
      `Grade: ${i.grade ?? ctx.profile.grade ?? "unknown"}`,
      `Hours available per week: ${i.hoursPerWeek ?? "unknown"}`,
      ctx.profile.interests?.length ? `Interests: ${ctx.profile.interests.join(", ")}` : "",
      ctx.profile.transport === "bus_walk" ? "The student has no car." : "",
      `Today's date: ${ctx.today}`,
      `Language: ${LANG_NAMES[ctx.locale] ?? "English"}`,
      `All "done" values must be false.`,
    ]
      .filter(Boolean)
      .join("\n"),
  demo: (i, ctx) => demoPlan(i.goal, ctx.locale),
  textForSafety: (i) => i.goal,
};

export const planAdjust: TaskDef<z.infer<typeof AdjustInput>, PlanOutputT> = {
  input: AdjustInput,
  output: PlanOutput,
  system: ADJUST_SYSTEM,
  prompt: (i, ctx) =>
    [
      `Goal: ${i.goal}`,
      `Hours available per week: ${i.hoursPerWeek ?? "unknown"}`,
      `Current plan:\n${i.milestones.map((m) => `- [${m.done ? "x" : " "}] (${m.horizon}) ${m.title}`).join("\n")}`,
      `Student's request: """${i.request}"""`,
      `Language: ${LANG_NAMES[ctx.locale] ?? "English"}`,
    ].join("\n\n"),
  demo: (i, ctx) => {
    // Simple demo adjustment: fewer hours → keep fewer open steps; otherwise add one step.
    const es = ctx.locale === "es";
    const less = /\b(less|fewer|only|busy|menos|solo|ocupad)\w*/i.test(i.request);
    const done = i.milestones.filter((m) => m.done);
    const open = i.milestones.filter((m) => !m.done);
    const kept = less ? open.filter((_, idx) => idx % 2 === 0) : open;
    const milestones = [...done, ...kept].map((m) => ({ title: m.title, detail: "", horizon: m.horizon, searchQuery: null, done: m.done }));
    if (!less) milestones.push({ title: es ? `Nuevo paso: ${i.request.slice(0, 80)}` : `New step: ${i.request.slice(0, 80)}`, detail: "", horizon: "month", searchQuery: null, done: false });
    return {
      summary: less ? (es ? "Hice el plan más ligero para que quepa en tu semana." : "I made the plan lighter so it fits your week.") : es ? "Agregué un paso según lo que pediste." : "I added a step based on your request.",
      milestones,
    };
  },
  textForSafety: (i) => `${i.goal} ${i.request}`,
};
