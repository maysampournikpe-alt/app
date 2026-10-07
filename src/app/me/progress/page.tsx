"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, FileText, CalendarDays } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { computeStats, hoursByMonth } from "@/lib/stats";
import { planProgress } from "@/lib/plan-utils";
import { PageHeader, SectionTitle, ProgressBar } from "@/components/ui/misc";
import { Card, LinkCard } from "@/components/ui/Card";
import { ProgressExtras } from "@/components/me/ProgressExtras";

/** 2.2.4 Progress dashboard: applications, hours, plan steps, certificates. */
export default function ProgressPage() {
  const { t, dateLocale } = useT();
  const s = useApp();
  const st = computeStats(s);
  const months = hoursByMonth(s.volunteer, 6);
  const maxH = Math.max(1, ...months.map((m) => m.hours));
  const tiles: [string, number, string][] = [
    ["saved", st.saved, "📌"],
    ["applied", st.applied, "📝"],
    ["accepted", st.accepted, "🎉"],
    ["hours", st.hours, "🤝"],
    ["steps", st.planSteps, "✅"],
    ["certs", st.certificates, "📜"],
  ];
  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("progress.title")} subtitle={t("progress.subtitle")} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([k, n, e]) => (
          <li key={k} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <p aria-hidden="true" className="text-2xl">
              {e}
            </p>
            <p className="text-3xl font-bold">{Math.round(n * 10) / 10}</p>
            <p className="text-sm font-bold text-muted">{t(`progress.${k}`)}</p>
          </li>
        ))}
      </ul>

      <SectionTitle>{t("progress.hoursByMonth")}</SectionTitle>
      <Card>
        <ul className="flex h-40 items-end gap-2" aria-label={t("progress.hoursByMonth")}>
          {months.map((m) => {
            const label = new Date(`${m.month}-02`).toLocaleDateString(dateLocale, { month: "short" });
            return (
              <li key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold">{m.hours}</span>
                <span className="w-full rounded-t-lg bg-success" style={{ height: `${Math.max(4, (m.hours / maxH) * 100)}%` }} aria-hidden="true" />
                <span className="text-xs text-muted">{label}</span>
                <span className="sr-only">
                  {label}: {m.hours}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <SectionTitle>{t("progress.plans")}</SectionTitle>
      {s.plans.length ? (
        <ul className="space-y-2">
          {s.plans.map((p) => {
            const pr = planProgress(p);
            return (
              <li key={p.id}>
                <Link href={`/plan/view?id=${p.id}`} className="block rounded-xl border border-border bg-surface p-3 hover:border-primary">
                  <span className="font-bold">{p.goal}</span>
                  <span className="ml-2 text-sm text-muted">{t("plan.stepsDone", { done: pr.done, total: pr.total })}</span>
                  <ProgressBar value={pr.pct} label={p.goal} className="mt-2" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("progress.noPlans")}</p>
      )}

      <ProgressExtras />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <LinkCard href="/me/tracker" icon={<ClipboardList className="size-5" />} title={t("progress.tracker")} subtitle={t("progress.trackerSub")} />
        <LinkCard href="/me/resume" icon={<FileText className="size-5" />} title={t("progress.resume")} subtitle={t("progress.resumeSub")} />
        <LinkCard href="/plan/calendar" icon={<CalendarDays className="size-5" />} title={t("progress.calendar")} subtitle={t("progress.calendarSub")} />
      </div>
    </div>
  );
}
