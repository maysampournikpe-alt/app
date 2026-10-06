import { describe, it, expect } from "vitest";
import { monthlyChallenge, yearReview, schoolYearOf, badgeStatus } from "@/lib/fun";

const base = { saved: [], plans: [], volunteer: [], accomplishments: [], certificates: [], streak: { count: 0, best: 0 }, dailyDone: [], practiceScores: [], decks: [], chats: [], history: [], xpLog: [] } as unknown as Parameters<typeof yearReview>[0];

describe("phase 9 fun helpers", () => {
  it("rotates the monthly challenge and counts only this month", () => {
    // October 2026 → index (2026*12+9) % 6
    const now = new Date(2026, 9, 15);
    const c = monthlyChallenge({ ...base, volunteer: [{ id: "a", date: "2026-10-03", org: "x", hours: 3 }, { id: "b", date: "2026-09-30", org: "x", hours: 9 }], dailyDone: ["2026-10-01", "2026-09-01"], practiceScores: [{ test: "sat", score: 1, total: 2, at: "2026-10-02T12:00:00Z" }] } as never, now);
    expect(c.daysLeft).toBe(16);
    if (c.kind === "hours") expect(c.progress).toBe(3);
    if (c.kind === "daily") expect(c.progress).toBe(1);
    if (c.kind === "practice") expect(c.progress).toBe(1);
  });
  it("school year runs August to July", () => {
    expect(schoolYearOf(new Date(2026, 7, 1))).toBe(2026);
    expect(schoolYearOf(new Date(2026, 6, 31))).toBe(2025);
  });
  it("year in review only counts that school year", () => {
    const r = yearReview(
      {
        ...base,
        volunteer: [
          { id: "1", date: "2026-09-10", org: "a", hours: 4 },
          { id: "2", date: "2026-11-10", org: "a", hours: 6 },
          { id: "3", date: "2026-07-10", org: "a", hours: 50 },
        ],
        xpLog: [
          { reason: "apply", xp: 25, at: "2026-09-02T15:00:00Z" },
          { reason: "accepted", xp: 75, at: "2026-10-02T15:00:00Z" },
          { reason: "apply", xp: 25, at: "2026-05-02T15:00:00Z" },
        ],
      } as never,
      2026,
    );
    expect(r).toMatchObject({ hours: 10, applied: 1, accepted: 1, xp: 100, topMonth: { month: "2026-11", hours: 6 }, empty: false });
    expect(yearReview(base, 2026).empty).toBe(true);
  });
  it("badges are earned from what the student did", () => {
    const b = badgeStatus({ ...base, volunteer: [{ id: "1", date: "2026-09-10", org: "a", hours: 12 }] } as never);
    expect(b.filter((x) => x.earned).map((x) => x.id)).toEqual(["helper", "volunteer_10"]);
  });
});
