import { describe, it, expect } from "vitest";
import { buildIcs, findConflicts, googleCalendarUrl, savedEvents, dueReminders } from "@/lib/calendar";
import { todayISO } from "@/lib/utils";
import type { Opportunity, SavedItem } from "@/types";

const opp = (id: string, extra: Partial<Opportunity>): Opportunity => ({
  id, title: `Opp ${id}`, organization: "Org", description: "", category: "event", cost: { type: "free" }, mode: "in_person", carFree: "unknown", source: "web", ...extra,
});
const saved = (o: Opportunity): SavedItem => ({ id: o.id, opp: o, status: "saved", savedAt: "", updatedAt: "" });

describe("calendar", () => {
  it("builds an .ics file with two reminders per deadline", () => {
    const ics = buildIcs(savedEvents([saved(opp("a", { deadline: "2026-11-03", sourceUrl: "https://x.org" }))]), { deadline: "Deadline", reminder: "Reminder" });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261103");
    expect(ics).toContain("DTEND;VALUE=DATE:20261104");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(ics).toContain("TRIGGER:-P7D");
  });
  it("makes Google Calendar links", () => {
    const [e] = savedEvents([saved(opp("a", { deadline: "2026-12-31" }))]);
    expect(googleCalendarUrl(e, "Deadline")).toContain("dates=20261231%2F20270101");
  });
  it("finds overlapping events", () => {
    const evs = savedEvents([
      saved(opp("a", { startDate: "2027-06-01", endDate: "2027-06-10" })),
      saved(opp("b", { startDate: "2027-06-05" })),
      saved(opp("c", { startDate: "2027-07-01" })),
    ]);
    const c = findConflicts(evs);
    expect(c).toHaveLength(1);
    expect([c[0][0].opp.id, c[0][1].opp.id]).toEqual(["a", "b"]);
  });
  it("knows which reminders are due", () => {
    const r = dueReminders([saved(opp("a", { deadline: todayISO(1) })), saved(opp("b", { deadline: todayISO(6) })), saved(opp("c", { deadline: todayISO(30) }))]);
    expect(r.map((x) => [x.item.id, x.days])).toEqual([["a", 1], ["b", 7]]);
  });
});
