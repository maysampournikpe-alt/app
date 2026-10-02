"use client";

import type { ScheduleBlock } from "@/types";
import { useT } from "@/i18n/useT";
import { hoursByKind } from "@/lib/balance";

// Four groups for the balance meter (Phase 7.4). Colors are paired with text labels,
// so color is never the only way to read the meter.
export const BALANCE_GROUPS = [
  { id: "learn", kinds: ["school", "study"], color: "bg-primary" },
  { id: "activities", kinds: ["practice", "other"], color: "bg-accent" },
  { id: "work", kinds: ["work"], color: "bg-warning" },
  { id: "recharge", kinds: ["rest", "social", "family"], color: "bg-success" },
] as const;

/** Stacked bar + legend showing how the week is split. */
export function BalanceBars({ blocks }: { blocks: ScheduleBlock[] }) {
  const { t } = useT();
  const by = hoursByKind(blocks);
  const groups = BALANCE_GROUPS.map((g) => ({ ...g, hours: g.kinds.reduce((n, k) => n + by[k], 0) }));
  const total = groups.reduce((n, g) => n + g.hours, 0) || 1;
  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        {groups.map((g) => (g.hours > 0 ? <span key={g.id} className={g.color} style={{ width: `${(g.hours / total) * 100}%` }} /> : null))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {groups.map((g) => (
          <li key={g.id} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${g.color}`} />
            <span>
              {t(`wellbeing.group_${g.id}`)}: <span className="font-bold">{t("life.hoursN", { n: Math.round(g.hours * 10) / 10 })}</span> ({Math.round((g.hours / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
