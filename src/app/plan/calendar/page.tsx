"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarPlus, Bell, ExternalLink } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { savedEvents, buildIcs, googleCalendarUrl, findConflicts, type CalEvent } from "@/lib/calendar";
import { cn, daysUntil, downloadFile, formatDate, toISODate, todayISO } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OpportunityDetails } from "@/components/finder/OpportunityDetails";

/** 2.3 Deadline calendar, reminders, calendar sync, and time-conflict checker. */
export default function CalendarPage() {
  const { t, dateLocale } = useT();
  const saved = useApp((s) => s.saved);
  const events = useMemo(() => savedEvents(saved), [saved]);
  const conflicts = useMemo(() => findConflicts(events), [events]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState<Opportunity | null>(null);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [events]);

  // Build the month grid (weeks start on Sunday).
  const first = month;
  const startOffset = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(first.getFullYear(), first.getMonth(), i + 1)))];
  while (cells.length % 7) cells.push(null);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 1, 1 + i).toLocaleDateString(dateLocale, { weekday: "narrow" }));
  const today = todayISO();
  const upcoming = events.filter((e) => e.date >= today).slice(0, 12);
  const dayList = selected ? (byDay.get(selected) ?? []) : [];

  function downloadAll() {
    downloadFile("rumbo-deadlines.ics", buildIcs(events, { deadline: t("calendar.deadline"), reminder: t("calendar.reminder") }), "text/calendar");
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  }

  const EventRow = ({ e }: { e: CalEvent }) => {
    const d = daysUntil(e.date);
    return (
      <li className="rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={e.kind === "deadline" ? "accent" : "primary"}>{e.kind === "deadline" ? t("calendar.deadline") : t("calendar.event")}</Badge>
          <span className="text-sm font-bold">{formatDate(e.date, dateLocale, { weekday: "short", month: "short", day: "numeric" })}</span>
          {d !== undefined && d >= 0 && d <= 60 && <span className={cn("text-sm", d <= 7 && "font-bold text-accent")}>{d === 0 ? t("common.today") : t("common.daysLeft", { count: d })}</span>}
        </div>
        <button type="button" onClick={() => setOpen(e.opp)} className="mt-1 text-left font-bold hover:underline">
          {e.opp.title}
        </button>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <a href={googleCalendarUrl(e, t("calendar.deadline"))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 font-bold text-primary underline underline-offset-4">
            {t("calendar.google")}
            <ExternalLink aria-hidden="true" className="size-3.5" />
            <span className="sr-only">{t("common.externalLink")}</span>
          </a>
          <button
            type="button"
            onClick={() => downloadFile(`${e.opp.title.slice(0, 40).replace(/[^\w-]+/g, "-")}.ics`, buildIcs([e], { deadline: t("calendar.deadline"), reminder: t("calendar.reminder") }), "text/calendar")}
            className="inline-flex min-h-9 items-center gap-1 font-bold text-primary underline underline-offset-4"
          >
            {t("calendar.addOne")}
          </button>
        </div>
      </li>
    );
  };

  return (
    <div>
      <Link href="/plan" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("plan.title")}
      </Link>
      <PageHeader title={t("calendar.title")} subtitle={t("calendar.subtitle")} />

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" aria-label={t("calendar.prevMonth")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-2">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <h2 className="text-lg font-bold capitalize" aria-live="polite">
            {month.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
          </h2>
          <button type="button" aria-label={t("calendar.nextMonth")} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-2">
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div role="grid" aria-label={month.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })} className="grid grid-cols-7 gap-1 text-center">
          <div role="row" className="contents">
            {weekdays.map((w, i) => (
              <div role="columnheader" key={i} className="py-1 text-xs font-bold text-muted">
                {w}
              </div>
            ))}
          </div>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <div role="row" className="contents" key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((iso, i) => {
                if (!iso) return <div role="gridcell" key={i} />;
                const evs = byDay.get(iso) ?? [];
                const day = Number(iso.slice(8));
                const label = `${formatDate(iso, dateLocale, { weekday: "long", month: "long", day: "numeric" })}${evs.length ? ` — ${evs.map((e) => e.opp.title).join(", ")}` : ""}`;
                return (
                  <div role="gridcell" key={i}>
                    <button
                      type="button"
                      aria-label={label}
                      aria-pressed={selected === iso}
                      onClick={() => setSelected(selected === iso ? null : iso)}
                      className={cn(
                        "flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm",
                        iso === today && "ring-2 ring-primary",
                        selected === iso ? "bg-primary text-on-primary" : evs.length ? "bg-accent-soft font-bold text-on-accent-soft" : "hover:bg-surface-2",
                      )}
                    >
                      {day}
                      {evs.length > 0 && <span aria-hidden="true" className={cn("mt-0.5 size-1.5 rounded-full", selected === iso ? "bg-on-primary" : "bg-accent")} />}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {selected && (
          <div className="mt-4">
            <p className="mb-2 font-bold">{t("calendar.dayEvents", { date: formatDate(selected, dateLocale, { month: "long", day: "numeric" }) })}</p>
            {dayList.length ? (
              <ul className="space-y-2">
                {dayList.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">—</p>
            )}
          </div>
        )}
      </Card>

      <section aria-labelledby="conflicts">
        <SectionTitle id="conflicts">{t("calendar.conflicts")}</SectionTitle>
        {conflicts.length ? (
          <ul className="space-y-2">
            {conflicts.map(([a, b]) => (
              <li key={`${a.id}-${b.id}`}>
                <Alert tone="warning" title={formatDate(a.date, dateLocale)}>
                  {t("calendar.conflictPair", { a: a.opp.title, b: b.opp.title })}
                </Alert>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("calendar.noConflicts")}</p>
        )}
      </section>

      <section aria-labelledby="upcoming">
        <SectionTitle id="upcoming">{t("calendar.upcoming")}</SectionTitle>
        {upcoming.length ? (
          <ul className="space-y-2">
            {upcoming.map((e) => (
              <EventRow key={e.id} e={e} />
            ))}
          </ul>
        ) : (
          <EmptyState icon="📅" title={t("calendar.none")} />
        )}
      </section>

      <SectionTitle>{t("calendar.reminder")}</SectionTitle>
      <div className="space-y-3">
        <Card>
          <Button onClick={downloadAll} disabled={!events.length} icon={<CalendarPlus aria-hidden="true" className="size-4" />}>
            {t("calendar.downloadIcs")}
          </Button>
          <p className="mt-2 text-sm text-muted">{t("calendar.downloadIcsHelp")}</p>
        </Card>
        <Card>
          {perm === "granted" ? (
            <p className="font-bold text-success">{t("calendar.notifyOn")}</p>
          ) : perm === "denied" ? (
            <p className="text-sm">{t("calendar.notifyBlocked")}</p>
          ) : perm === "unsupported" ? null : (
            <>
              <Button variant="soft" onClick={enableNotifications} icon={<Bell aria-hidden="true" className="size-4" />}>
                {t("calendar.notify")}
              </Button>
              <p className="mt-2 text-sm text-muted">{t("calendar.notifyHelp")}</p>
            </>
          )}
          <p className="mt-3 text-xs text-muted">{t("calendar.emailSmsNote")}</p>
        </Card>
      </div>
      <OpportunityDetails opp={open} onClose={() => setOpen(null)} />
    </div>
  );
}
