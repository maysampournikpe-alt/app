"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useT } from "@/i18n/useT";
import { CATEGORIES } from "@/types";
import { useFinder, countActiveFilters, type FinderFilters } from "@/lib/finder-client";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { Field, Select } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { CATEGORY_EMOJI } from "@/lib/categories";

/** The filter bar: a big "Free only" switch plus a panel with all the other filters. */
export function FilterBar() {
  const { t } = useT();
  const filters = useFinder((s) => s.filters);
  const setFilters = useFinder((s) => s.setFilters);
  const resetFilters = useFinder((s) => s.resetFilters);
  const onlineOnly = useApp((s) => s.settings.onlineOnly);
  const [open, setOpen] = useState(false);
  const n = countActiveFilters({ ...filters, cost: "any" });

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <Chip selected={filters.cost === "free"} onClick={() => setFilters({ cost: filters.cost === "free" ? "any" : "free" })} className="!min-h-12 !px-5 !text-base">
        <span aria-hidden="true">🆓</span>
        {t("find.freeOnly")}
      </Chip>
      <Chip selected={filters.paidOnly} onClick={() => setFilters({ paidOnly: !filters.paidOnly })} size="sm">
        <span aria-hidden="true">💵</span>
        {t("find.paidOnly")}
      </Chip>
      <Chip selected={n > 0} onClick={() => setOpen(true)} size="sm" icon={<SlidersHorizontal aria-hidden="true" className="size-4" />}>
        {n > 0 ? t("find.filtersCount", { n }) : t("find.filters")}
      </Chip>
      {onlineOnly && <span className="shrink-0 rounded-full bg-warning-soft px-3 py-1.5 text-sm font-bold text-warning">{t("find.online_only_mode")}</span>}

      <Sheet open={open} onClose={() => setOpen(false)} title={t("find.filters")} closeLabel={t("common.close")}>
        <div className="space-y-4">
          <Field label={t("find.category")}>
            {(id) => (
              <Select id={id} value={filters.category ?? ""} onChange={(e) => setFilters({ category: (e.target.value || undefined) as FinderFilters["category"] })}>
                <option value="">{t("find.allCategories")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_EMOJI[c]} {t(`cat.${c}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("find.cost")}>
            {(id) => (
              <Select id={id} value={filters.cost} onChange={(e) => setFilters({ cost: e.target.value as FinderFilters["cost"] })}>
                <option value="any">{t("find.costAny")}</option>
                <option value="free">{t("find.costFree")}</option>
                <option value="paid">{t("find.costPaid")}</option>
              </Select>
            )}
          </Field>
          <Field label={t("find.distance")}>
            {(id) => (
              <Select id={id} value={filters.maxMiles ?? ""} onChange={(e) => setFilters({ maxMiles: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">{t("find.distanceAny")}</option>
                {[5, 10, 25, 50, 100].map((m) => (
                  <option key={m} value={m}>
                    {t("find.distanceN", { n: m })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("find.where")}>
            {(id) => (
              <Select id={id} value={onlineOnly ? "online" : filters.where} disabled={onlineOnly} onChange={(e) => setFilters({ where: e.target.value as FinderFilters["where"] })}>
                <option value="any">{t("find.whereAny")}</option>
                <option value="online">{t("find.whereOnline")}</option>
                <option value="in_person">{t("find.whereInPerson")}</option>
              </Select>
            )}
          </Field>
          <Field label={t("find.deadline")}>
            {(id) => (
              <Select id={id} value={filters.deadline} onChange={(e) => setFilters({ deadline: e.target.value as FinderFilters["deadline"] })}>
                <option value="any">{t("find.deadlineAny")}</option>
                <option value="2w">{t("find.deadlineSoon")}</option>
                <option value="1m">{t("find.deadlineMonth")}</option>
                <option value="has">{t("find.deadlineHas")}</option>
              </Select>
            )}
          </Field>
          <div className="divide-y divide-border">
            <Toggle checked={filters.myGrade} onChange={(v) => setFilters({ myGrade: v })} label={t("find.gradeFilter")} />
            <Toggle checked={filters.paidOnly} onChange={(v) => setFilters({ paidOnly: v })} label={t("find.paidOnly")} help={t("find.paidOnlyHelp")} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetFilters}>
              {t("find.clearFilters")}
            </Button>
            <Button full onClick={() => setOpen(false)}>
              {t("find.applyFilters")}
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
