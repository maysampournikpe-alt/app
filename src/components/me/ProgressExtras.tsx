"use client";

import { Trophy, Palette, CalendarHeart, School } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { badgeStatus, monthlyChallenge } from "@/lib/fun";
import { Card, LinkCard } from "@/components/ui/Card";
import { ProgressBar, SectionTitle } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/** 9.2–9.3 Badges and this month's challenge on the progress page. */
export function ProgressExtras() {
  const { t } = useT();
  const s = useApp();
  const badges = badgeStatus(s);
  const earned = badges.filter((b) => b.earned).length;
  const c = monthlyChallenge(s);
  return (
    <>
      <SectionTitle>{t("fun.monthlyTitle")}</SectionTitle>
      <Card className="flex items-center gap-4">
        <Trophy aria-hidden="true" className={cn("size-10 shrink-0", c.done ? "text-success" : "text-accent")} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t(`fun.monthly_${c.id}`, { target: c.target })}</p>
          <ProgressBar value={Math.min(1, c.progress / c.target)} label={t("fun.monthlyTitle")} className="mt-2" tone={c.done ? "success" : "accent"} />
          <p className="mt-1 text-sm text-muted">{c.done ? t("fun.monthlyDone") : `${t("fun.monthlyProgress", { n: c.progress, target: c.target })} · ${t("fun.monthlyDaysLeft", { count: c.daysLeft })}`}</p>
        </div>
      </Card>

      <SectionTitle>
        {t("progress.badges")} <span className="text-base font-normal text-muted">({t("fun.badgesEarned", { n: earned, total: badges.length })})</span>
      </SectionTitle>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {badges.map((b) => (
          <li key={b.id} className={cn("rounded-xl border p-3 text-center", b.earned ? "border-accent bg-accent-soft" : "border-dashed border-border bg-surface")}>
            <span aria-hidden="true" className={cn("block text-3xl", !b.earned && "opacity-40 grayscale")}>
              {b.icon}
            </span>
            <span className="block font-bold">{t(`fun.badge_${b.id}`)}</span>
            <span className="block text-xs text-muted">
              {b.earned ? "✓ " : <span className="sr-only">{t("fun.badgeLocked")}: </span>}
              {t(`fun.badge_${b.id}_how`)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <LinkCard href="/me/year" icon={<CalendarHeart className="size-5" />} title={t("fun.yearTitle")} subtitle={t("fun.yearSub")} />
        <LinkCard href="/me/avatar" icon={<Palette className="size-5" />} title={t("fun.avatarTitle")} subtitle={t("fun.avatarSub")} />
        <LinkCard href="/me/leaderboard" icon={<School className="size-5" />} title={t("fun.leaderTitle")} subtitle={t("fun.leaderSub")} />
      </div>
    </>
  );
}
