import type { AppState } from "./store";
import type { BadgeStats } from "./gamification";

/** Count everything the student has done (used by progress, badges, school sharing, year in review). */
export function computeStats(s: Pick<AppState, "saved" | "plans" | "volunteer" | "accomplishments" | "certificates" | "streak" | "dailyDone" | "practiceScores" | "decks" | "chats" | "history">): BadgeStats & { searches: number } {
  const statusCount = (st: string) => s.saved.filter((x) => x.status === st).length;
  return {
    saved: s.saved.length,
    applied: s.saved.filter((x) => ["applied", "accepted", "attended"].includes(x.status)).length,
    accepted: statusCount("accepted"),
    attended: statusCount("attended"),
    plans: s.plans.length,
    planSteps: s.plans.reduce((n, p) => n + p.milestones.filter((m) => m.done).length, 0),
    plansDone: s.plans.filter((p) => p.milestones.length && p.milestones.every((m) => m.done)).length,
    hours: s.volunteer.reduce((n, v) => n + v.hours, 0),
    accomplishments: s.accomplishments.length,
    certificates: s.certificates.filter((c) => c.status === "earned").length,
    streakBest: s.streak.best,
    dailyDone: s.dailyDone.length,
    practiceTests: s.practiceScores.length,
    decks: s.decks.length,
    coachChats: s.chats.length,
    languages: 0,
    searches: s.history.reduce((n) => n + 1, 0),
  };
}

/** Volunteer hours for each of the last N months (oldest first). */
export function hoursByMonth(volunteer: AppState["volunteer"], months = 6): { month: string; hours: number }[] {
  const out: { month: string; hours: number }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = months - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    out.push({ month: key, hours: volunteer.filter((v) => v.date.startsWith(key)).reduce((n, v) => n + v.hours, 0) });
  }
  return out;
}
