import { z } from "zod";

// Shape of a plan returned by the AI (shared by server and browser).
const Milestone = z.object({
  title: z.string(),
  detail: z.string(),
  horizon: z.enum(["week", "month", "year"]),
  searchQuery: z.string().nullable(),
  done: z.boolean(),
});
export const PlanOutput = z.object({ summary: z.string(), milestones: z.array(Milestone) });
export type PlanOutputT = z.infer<typeof PlanOutput>;
