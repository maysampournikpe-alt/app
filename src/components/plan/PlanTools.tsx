"use client";

import { useT } from "@/i18n/useT";
import { SectionTitle } from "@/components/ui/misc";
import { LinkCard } from "@/components/ui/Card";

/** Links to the other planning tools (calendar, schedule, wellbeing, budget, packing). */
export const PLAN_TOOL_LINKS: { href: string; icon: string; title: string; subtitle: string }[] = [
  { href: "/plan/calendar", icon: "📅", title: "calendar.title", subtitle: "calendar.subtitle" },
  { href: "/plan/schedule", icon: "🗓️", title: "life.scheduleTitle", subtitle: "life.scheduleSub" },
  { href: "/plan/wellbeing", icon: "💚", title: "wellbeing.title", subtitle: "wellbeing.subtitle" },
  { href: "/plan/budget", icon: "💵", title: "life.budgetTitle", subtitle: "life.budgetSub" },
  { href: "/plan/packing", icon: "🎒", title: "life.packingTitle", subtitle: "life.packingSub" },
];

export function PlanTools() {
  const { t } = useT();
  if (!PLAN_TOOL_LINKS.length) return null;
  return (
    <section aria-labelledby="plan-tools">
      <SectionTitle id="plan-tools">{t("plan.tools")}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLAN_TOOL_LINKS.map((l) => (
          <LinkCard key={l.href} href={l.href} icon={l.icon} title={t(l.title)} subtitle={t(l.subtitle)} />
        ))}
      </div>
    </section>
  );
}
