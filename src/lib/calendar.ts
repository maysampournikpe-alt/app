// Calendar helpers: deadlines, "Add to calendar" files, Google Calendar links, conflict checks.
import type { Opportunity, SavedItem } from "@/types";
import { daysUntil, parseISODate, toISODate } from "./utils";

const ymd = (iso: string) => iso.replace(/-/g, "");
function nextDay(iso: string) {
  const d = parseISODate(iso)!;
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
/** Long lines in .ics files must be folded at 75 characters. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  kind: "deadline" | "event";
  opp: Opportunity;
}

/** Every dated thing from saved opportunities (deadlines + start dates). */
export function savedEvents(saved: SavedItem[]): CalEvent[] {
  const out: CalEvent[] = [];
  for (const s of saved) {
    if (s.status === "declined") continue;
    if (s.opp.deadline) out.push({ id: `${s.id}-d`, date: s.opp.deadline, kind: "deadline", opp: s.opp });
    if (s.opp.startDate) out.push({ id: `${s.id}-e`, date: s.opp.startDate, endDate: s.opp.endDate, kind: "event", opp: s.opp });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * A calendar file (.ics) that works with Google, Apple and Outlook calendars.
 * Each deadline has two alarms: 1 week before and 1 day before — so the student's
 * own phone reminds them, even when Rumbo is closed (2.3.2).
 */
export function buildIcs(events: CalEvent[], labels: { deadline: string; reminder: string }): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rumbo//Student Opportunities//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    const title = e.kind === "deadline" ? `${labels.deadline}: ${e.opp.title}` : e.opp.title;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@rumbo.app`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(e.endDate ?? e.date))}`,
      fold(`SUMMARY:${esc(title)}`),
      fold(`DESCRIPTION:${esc([e.opp.organization, e.opp.sourceUrl].filter(Boolean).join("\n"))}`),
    );
    if (e.opp.city || e.opp.mode === "online") lines.push(fold(`LOCATION:${esc(e.opp.mode === "online" ? "Online" : e.opp.city ?? "")}`));
    if (e.opp.sourceUrl) lines.push(fold(`URL:${e.opp.sourceUrl}`));
    for (const trigger of ["-P7D", "-P1D"]) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", fold(`DESCRIPTION:${esc(`${labels.reminder}: ${title}`)}`), `TRIGGER:${trigger}`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** "Add to Google Calendar" link — no Google login or API key needed in our app (2.3.3). */
export function googleCalendarUrl(e: CalEvent, deadlineLabel: string): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.kind === "deadline" ? `${deadlineLabel}: ${e.opp.title}` : e.opp.title,
    dates: `${ymd(e.date)}/${ymd(nextDay(e.endDate ?? e.date))}`,
    details: [e.opp.organization, e.opp.sourceUrl].filter(Boolean).join("\n"),
    location: e.opp.mode === "online" ? "Online" : (e.opp.city ?? ""),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** 2.3.4 Time conflicts: saved events whose dates overlap. */
export function findConflicts(events: CalEvent[]): [CalEvent, CalEvent][] {
  const evs = events.filter((e) => e.kind === "event");
  const out: [CalEvent, CalEvent][] = [];
  for (let i = 0; i < evs.length; i++) {
    for (let j = i + 1; j < evs.length; j++) {
      const a = evs[i];
      const b = evs[j];
      if (a.opp.id === b.opp.id) continue;
      const aEnd = a.endDate ?? a.date;
      const bEnd = b.endDate ?? b.date;
      if (a.date <= bEnd && b.date <= aEnd) out.push([a, b]);
    }
  }
  return out;
}

/** Which reminders are due today: 7 days and 1 day before each deadline. */
export function dueReminders(saved: SavedItem[]): { item: SavedItem; days: 7 | 1 | 0 }[] {
  const out: { item: SavedItem; days: 7 | 1 | 0 }[] = [];
  for (const s of saved) {
    if (s.status !== "saved" || s.remindersOn === false || !s.opp.deadline) continue;
    const d = daysUntil(s.opp.deadline);
    if (d === undefined) continue;
    if (d <= 7 && d > 1) out.push({ item: s, days: 7 });
    else if (d === 1) out.push({ item: s, days: 1 });
    else if (d === 0) out.push({ item: s, days: 0 });
  }
  return out;
}
