import type { AppState } from "./store";
import { BADGES, MONTHLY_CHALLENGES } from "./gamification";
import { computeStats } from "./stats";
import { toISODate } from "./utils";

// Phase 9 helpers: badges, monthly challenge and year in review.
// Everything is calculated from what's already saved on the phone, so nothing extra is stored.

type FunState = Pick<AppState, "saved" | "plans" | "volunteer" | "accomplishments" | "certificates" | "streak" | "dailyDone" | "practiceScores" | "decks" | "chats" | "history" | "xpLog">;

/** Local date (YYYY-MM-DD) of an ISO timestamp or date. */
const day = (iso: string) => (iso.length === 10 ? iso : toISODate(new Date(iso)));

export function badgeStatus(s: FunState) {
  const stats = computeStats(s);
  return BADGES.map((b) => ({ ...b, earned: b.test(stats) }));
}

/** This month's challenge (rotates every month) and how far along the student is. */
export function monthlyChallenge(s: FunState, now = new Date()) {
  const month = toISODate(now).slice(0, 7);
  const index = (now.getFullYear() * 12 + now.getMonth()) % MONTHLY_CHALLENGES.length;
  const c = MONTHLY_CHALLENGES[index];
  const inMonth = (iso: string) => day(iso).startsWith(month);
  const xpCount = (reason: string) => s.xpLog.filter((e) => e.reason === reason && inMonth(e.at)).length;
  const progress =
    c.kind === "hours"
      ? s.volunteer.filter((v) => inMonth(v.date)).reduce((n, v) => n + v.hours, 0)
      : c.kind === "applied"
        ? xpCount("apply")
        : c.kind === "planSteps"
          ? xpCount("plan_step")
          : c.kind === "daily"
            ? s.dailyDone.filter(inMonth).length
            : c.kind === "saved"
              ? xpCount("save")
              : s.practiceScores.filter((p) => inMonth(p.at)).length;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { ...c, progress: Math.round(progress * 10) / 10, done: progress >= c.target, daysLeft: lastDay - now.getDate() };
}

/** School year that contains this date: Aug 1 → Jul 31. Returns the starting year. */
export function schoolYearOf(date = new Date()) {
  return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export function yearReview(s: FunState, startYear: number) {
  const from = `${startYear}-08-01`;
  const to = `${startYear + 1}-07-31`;
  const inYear = (iso?: string) => !!iso && day(iso) >= from && day(iso) <= to;
  const xpIn = s.xpLog.filter((e) => inYear(e.at));
  const count = (reason: string) => xpIn.filter((e) => e.reason === reason).length;
  const vol = s.volunteer.filter((v) => inYear(v.date));
  const byMonth = new Map<string, number>();
  for (const v of vol) byMonth.set(v.date.slice(0, 7), (byMonth.get(v.date.slice(0, 7)) ?? 0) + v.hours);
  const top = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0];
  const r = {
    from,
    to,
    xp: xpIn.reduce((n, e) => n + e.xp, 0),
    applied: count("apply"),
    accepted: count("accepted"),
    hours: Math.round(vol.reduce((n, v) => n + v.hours, 0) * 10) / 10,
    steps: count("plan_step"),
    plans: s.plans.filter((p) => inYear(p.completedAt)).length,
    daily: s.dailyDone.filter((d) => inYear(d)).length,
    tests: s.practiceScores.filter((p) => inYear(p.at)).length,
    accomplishments: s.accomplishments.filter((a) => inYear(a.date)),
    certs: s.certificates.filter((c) => c.status === "earned" && inYear(c.earned)),
    badges: badgeStatus(s).filter((b) => b.earned).length,
    topMonth: top ? { month: top[0], hours: Math.round(top[1] * 10) / 10 } : null,
  };
  const empty = !r.xp && !r.hours && !r.accomplishments.length && !r.certs.length && !r.daily && !r.tests;
  return { ...r, empty };
}
