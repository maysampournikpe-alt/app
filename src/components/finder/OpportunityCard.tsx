"use client";

import { Heart, ExternalLink, Sparkles, ShieldAlert, BadgeCheck, Clock, MapPin, Wifi, DollarSign, GraduationCap } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { oppFacts, scamTexts } from "./format";

/** One opportunity in the results list. Tap "Details" for everything. */
export function OpportunityCard({ opp, onOpen, compact }: { opp: Opportunity; onOpen: (o: Opportunity) => void; compact?: boolean }) {
  const { t, dateLocale } = useT();
  const isSaved = useApp((s) => s.saved.some((x) => x.id === opp.id));
  const save = useApp((s) => s.saveOpportunity);
  const unsave = useApp((s) => s.unsave);
  const f = oppFacts(opp, t, dateLocale);
  const warnings = scamTexts(opp, t);
  const titleId = `opp-${opp.id}-title`;

  return (
    <article aria-labelledby={titleId} className={cn("rounded-2xl border-2 border-b-4 border-border bg-surface p-4", warnings.length ? "border-danger/50" : "border-border")}>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone="primary">
          <span aria-hidden="true">{CATEGORY_EMOJI[opp.category]}</span>
          {t(`cat.${opp.category}`)}
        </Badge>
        {opp.verified && (
          <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
            {t("opp.verified")}
          </Badge>
        )}
        {opp.source === "demo" && <Badge tone="neutral">{t("opp.sample")}</Badge>}
        {opp.paid && <Badge tone="accent">{t("opp.paidWork")}</Badge>}
      </div>

      <h3 id={titleId} className="text-lg font-bold leading-snug">
        <button type="button" onClick={() => onOpen(opp)} className="text-left hover:underline">
          {opp.title}
        </button>
      </h3>
      {opp.organization && <p className="text-sm text-muted">{opp.organization}</p>}

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm" aria-label={t("opp.details")}>
        <li className="flex items-center gap-1.5">
          <DollarSign aria-hidden="true" className="size-4 text-muted" />
          <span className={cn(opp.cost.type === "free" && "font-bold text-success")}>{opp.cost.type === "free" ? t("common.free") : opp.cost.type === "paid" ? t("find.costPaid") : t("common.notListed")}</span>
        </li>
        <li className="flex items-center gap-1.5">
          {opp.mode === "online" ? <Wifi aria-hidden="true" className="size-4 text-muted" /> : <MapPin aria-hidden="true" className="size-4 text-muted" />}
          <span>
            {opp.mode === "online" ? t("opp.online") : opp.city ?? f.mode}
            {opp.distanceMiles !== undefined && opp.mode !== "online" && ` · ${t("opp.distance", { n: Math.round(opp.distanceMiles) })}`}
          </span>
        </li>
        {(opp.deadline || opp.dateText) && (
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4 text-muted" />
            <span className={cn(f.days !== undefined && f.days >= 0 && f.days <= 14 && "font-bold text-accent")}>
              {opp.deadline
                ? f.days !== undefined && f.days < 0
                  ? t("opp.deadlinePassed")
                  : f.days !== undefined && f.days <= 60
                    ? t("common.daysLeft", { count: f.days })
                    : t("opp.deadlineOn", { date: f.deadline })
                : compact
                  ? null
                  : opp.dateText}
            </span>
          </li>
        )}
        {f.who !== t("common.notListed") && (
          <li className="flex items-center gap-1.5">
            <GraduationCap aria-hidden="true" className="size-4 text-muted" />
            <span>{f.who}</span>
          </li>
        )}
      </ul>

      {!compact && opp.description && <p className="mt-2 line-clamp-3 text-sm">{opp.description}</p>}

      {opp.whyFits && (
        <p className="mt-3 flex gap-2 rounded-xl bg-primary-soft p-2.5 text-sm text-on-primary-soft">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-bold">{t("opp.whyFits")}: </span>
            {opp.whyFits}
          </span>
        </p>
      )}

      {warnings.length > 0 && (
        <div role="note" className="mt-3 flex gap-2 rounded-xl bg-danger-soft p-2.5 text-sm text-danger">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-bold">{t("opp.scamTitle")}: </span>
            {warnings[0]}
            {warnings.length > 1 && ` (+${warnings.length - 1})`}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() => (isSaved ? unsave(opp.id) : save(opp))}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 font-bold",
            isSaved ? "bg-accent-soft text-on-accent-soft" : "bg-primary text-on-primary hover:bg-primary-hover",
          )}
        >
          <Heart aria-hidden="true" className={cn("size-4", isSaved && "fill-current")} />
          {isSaved ? t("opp.saved") : t("opp.save")}
          <span className="sr-only">: {opp.title}</span>
        </button>
        <button type="button" onClick={() => onOpen(opp)} className="inline-flex min-h-11 items-center press rounded-2xl border-2 border-b-4 border-border bg-surface px-4 font-display text-sm font-extrabold hover:bg-surface-2 active:border-b-2">
          {t("opp.details")}
          <span className="sr-only">: {opp.title}</span>
        </button>
        {opp.sourceUrl && (
          <a
            href={opp.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 px-1 font-bold text-primary underline underline-offset-4"
          >
            {t("opp.source")}
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">
              {t("opp.sourceSr", { title: opp.title })} {t("common.externalLink")}
            </span>
          </a>
        )}
      </div>
    </article>
  );
}
