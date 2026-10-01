"use client";

import { useT } from "@/i18n/useT";
import { SectionTitle } from "@/components/ui/misc";
import { LinkCard } from "@/components/ui/Card";

/** Links to the other planning tools (calendar, schedule, budget, packing, wellbeing). Filled in as they're built. */
export const PLAN_TOOL_LINKS: { href: string; icon: string; key: string }[] = [{ href: "/plan/calendar", icon: "📅", key: "calendar" }];

export function PlanTools() {
  const { t } = useT();
  if (!PLAN_TOOL_LINKS.length) return null;
  return (
    <section aria-labelledby="plan-tools">
      <SectionTitle id="plan-tools">{t("plan.tools")}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLAN_TOOL_LINKS.map((l) => (
          <LinkCard key={l.href} href={l.href} icon={l.icon} title={t(`${l.key}.title`)} subtitle={t(`${l.key}.subtitle`)} />
        ))}
      </div>
    </section>
  );
}
