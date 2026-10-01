"use client";

import { TrendingUp, ClipboardList, FileText, CalendarDays } from "lucide-react";
import { useT } from "@/i18n/useT";
import { LinkCard } from "@/components/ui/Card";

/** Links to the Me-tab tools: progress, tracker, resume, calendar. */
export function MeExtraLinks() {
  const { t } = useT();
  return (
    <>
      <LinkCard href="/me/progress" icon={<TrendingUp className="size-5" />} title={t("me.progress")} subtitle={t("me.progressSub")} />
      <LinkCard href="/me/tracker" icon={<ClipboardList className="size-5" />} title={t("progress.tracker")} subtitle={t("progress.trackerSub")} />
      <LinkCard href="/me/resume" icon={<FileText className="size-5" />} title={t("progress.resume")} subtitle={t("progress.resumeSub")} />
      <LinkCard href="/plan/calendar" icon={<CalendarDays className="size-5" />} title={t("progress.calendar")} subtitle={t("progress.calendarSub")} />
    </>
  );
}
