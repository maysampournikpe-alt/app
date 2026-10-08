"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, CheckCircle2, XCircle } from "lucide-react";
import type { Opportunity, SavedStatus } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { daysUntil } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/ui/misc";
import { Chip } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { OpportunityCard } from "@/components/finder/OpportunityCard";
import { OpportunityDetails } from "@/components/finder/OpportunityDetails";
import { SavedItemExtras } from "@/components/me/SavedItemExtras";
import { ShareListButton } from "@/components/family/ShareListButton";

const STATUSES: SavedStatus[] = ["saved", "applied", "accepted", "attended", "declined"];
type Filter = "all" | "soon" | SavedStatus;

/** "My Saved": everything the student saved. Works offline. */
export default function SavedPage() {
  const { t } = useT();
  const saved = useApp((s) => s.saved);
  const setStatus = useApp((s) => s.setSavedStatus);
  const updateSaved = useApp((s) => s.updateSaved);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Opportunity | null>(null);

  const list = saved.filter((s) => {
    if (filter === "all") return true;
    if (filter === "soon") {
      const d = daysUntil(s.opp.deadline);
      return d !== undefined && d >= 0 && d <= 14;
    }
    return s.status === filter;
  });
  const statusLabel = (st: SavedStatus) => t(`opp.status${st.charAt(0).toUpperCase()}${st.slice(1)}`);

  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("me.saved")} subtitle={t("me.savedSub")} />

      {saved.length === 0 ? (
        <EmptyState icon="💾" title={t("me.savedEmpty")} body={t("me.savedEmptyHelp")} action={<ButtonLink href="/">{t("me.goFind")}</ButtonLink>} />
      ) : (
        <>
          <ShareListButton />
          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
            {(["all", "soon", "saved", "applied", "accepted"] as Filter[]).map((f) => (
              <Chip key={f} size="sm" selected={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? t("me.filterAll") : f === "soon" ? t("me.deadlineSoon") : statusLabel(f as SavedStatus)}
              </Chip>
            ))}
          </div>
          <ul className="space-y-4">
            {list.map((s) => (
              <li key={s.id} className="space-y-2">
                <OpportunityCard opp={s.opp} onOpen={setOpen} compact />
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <label className="sr-only" htmlFor={`st-${s.id}`}>
                    {t("me.statusLabel", { title: s.opp.title })}
                  </label>
                  <Select id={`st-${s.id}`} value={s.status} onChange={(e) => setStatus(s.id, e.target.value as SavedStatus)} className="!w-auto !py-1.5">
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {statusLabel(st)}
                      </option>
                    ))}
                  </Select>
                  {s.parentDecision === "pending" && <Badge tone="warning" icon={<Clock3 aria-hidden="true" className="size-3.5" />}>{t("me.awaitingParent")}</Badge>}
                  {s.parentDecision === "approved" && <Badge tone="success" icon={<CheckCircle2 aria-hidden="true" className="size-3.5" />}>{t("me.parentApproved")}</Badge>}
                  {s.parentDecision === "declined" && <Badge tone="danger" icon={<XCircle aria-hidden="true" className="size-3.5" />}>{t("me.parentDeclined")}</Badge>}
                </div>
                <details className="rounded-2xl border-2 border-b-4 border-border bg-surface px-3">
                  <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-bold">{t("me.notes")}</summary>
                  <label htmlFor={`n-${s.id}`} className="sr-only">
                    {t("me.notes")}: {s.opp.title}
                  </label>
                  <textarea
                    id={`n-${s.id}`}
                    defaultValue={s.notes}
                    onBlur={(e) => updateSaved(s.id, { notes: e.target.value.slice(0, 2000) })}
                    placeholder={t("me.notesPlaceholder")}
                    className="mb-3 min-h-20 w-full rounded-md border border-input bg-card p-2 text-sm shadow-xs focus:border-primary focus:outline-none"
                  />
                </details>
                <SavedItemExtras item={s} />
              </li>
            ))}
          </ul>
        </>
      )}
      <OpportunityDetails opp={open} onClose={() => setOpen(null)} />
    </div>
  );
}
