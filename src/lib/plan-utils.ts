import type { Milestone, Plan, SavedItem } from "@/types";
import type { PlanOutputT } from "./server/tasks/plan-types";
import { uid } from "./utils";

/** Turn AI/template output into milestones with IDs. */
export function toMilestones(out: PlanOutputT["milestones"]): Milestone[] {
  return out.map((m) => ({
    id: uid(8),
    title: m.title,
    detail: m.detail || undefined,
    horizon: m.horizon,
    done: m.done,
    doneAt: m.done ? new Date().toISOString() : undefined,
    searchQuery: m.searchQuery ?? undefined,
  }));
}

export function planProgress(p: Plan) {
  const total = p.milestones.length;
  const done = p.milestones.filter((m) => m.done).length;
  return { total, done, pct: total ? done / total : 0 };
}

const STOP = new Set(["with", "that", "this", "your", "from", "para", "como", "with", "into", "make", "team", "teens", "students", "program", "programs", "high", "school", "near", "free"]);

/** Saved opportunities that look related to a plan's goal (4.1.4 "Plan links to real opportunities"). */
export function relatedSaved(plan: Plan, saved: SavedItem[]): SavedItem[] {
  const text = [plan.goal, ...plan.milestones.map((m) => m.searchQuery ?? "")].join(" ").toLowerCase();
  const words = [...new Set(text.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w)))];
  return saved.filter((s) => {
    const hay = `${s.opp.title} ${s.opp.description} ${s.opp.organization}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return words.some((w) => hay.includes(w.slice(0, Math.max(4, w.length - 2))));
  });
}
