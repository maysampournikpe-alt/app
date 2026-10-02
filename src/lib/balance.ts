// Weekly schedule math (Phase 5.1) + balance meter and burnout check (Phase 7).
import type { ScheduleBlock, ScheduleKind } from "@/types";

export const SCHEDULE_KINDS: ScheduleKind[] = ["school", "study", "practice", "work", "family", "social", "rest", "other"];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Length of a block in hours (blocks that cross midnight wrap around). */
export function blockHours(b: Pick<ScheduleBlock, "start" | "end">): number {
  let d = toMinutes(b.end) - toMinutes(b.start);
  if (d <= 0) d += 24 * 60;
  return d / 60;
}

export function hoursByKind(blocks: ScheduleBlock[]): Record<ScheduleKind, number> {
  const out = Object.fromEntries(SCHEDULE_KINDS.map((k) => [k, 0])) as Record<ScheduleKind, number>;
  for (const b of blocks) out[b.kind] += blockHours(b);
  return out;
}

/** Pairs of blocks on the same day that overlap in time. */
export function overlaps(blocks: ScheduleBlock[]): [ScheduleBlock, ScheduleBlock][] {
  const out: [ScheduleBlock, ScheduleBlock][] = [];
  for (let d = 0; d < 7; d++) {
    const day = blocks.filter((b) => b.day === d).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    for (let i = 0; i < day.length; i++)
      for (let j = i + 1; j < day.length; j++) if (toMinutes(day[j].start) < toMinutes(day[i].end) && toMinutes(day[i].end) > toMinutes(day[i].start)) out.push([day[i], day[j]]);
  }
  return out;
}

const BUSY: ScheduleKind[] = ["school", "study", "practice", "work", "other"];

export interface BurnoutCheck {
  level: "ok" | "busy" | "overloaded";
  committedHours: number; // per week, not counting rest/social/family
  restHours: number;
  heavyDays: number; // days with 11+ committed hours
  workHours: number;
  reasons: ("heavy_days" | "little_rest" | "lots_of_work" | "many_deadlines" | "too_many_hours")[];
}

/** Gentle overload check based on the student's week and upcoming deadlines. */
export function burnoutCheck(blocks: ScheduleBlock[], deadlinesThisWeek = 0): BurnoutCheck {
  const byKind = hoursByKind(blocks);
  const committedHours = BUSY.reduce((n, k) => n + byKind[k], 0);
  const restHours = byKind.rest + byKind.social + byKind.family;
  let heavyDays = 0;
  for (let d = 0; d < 7; d++) {
    const h = blocks.filter((b) => b.day === d && BUSY.includes(b.kind)).reduce((n, b) => n + blockHours(b), 0);
    if (h >= 11) heavyDays++;
  }
  const reasons: BurnoutCheck["reasons"] = [];
  if (committedHours > 60) reasons.push("too_many_hours");
  if (heavyDays >= 3) reasons.push("heavy_days");
  if (blocks.length >= 5 && restHours < 5) reasons.push("little_rest");
  if (byKind.work > 20) reasons.push("lots_of_work");
  if (deadlinesThisWeek >= 3) reasons.push("many_deadlines");
  const level = reasons.length >= 2 || committedHours > 70 ? "overloaded" : reasons.length === 1 ? "busy" : "ok";
  return { level, committedHours, restHours, heavyDays, workHours: byKind.work, reasons };
}
