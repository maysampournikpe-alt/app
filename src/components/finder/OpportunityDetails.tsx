"use client";

import Link from "next/link";
import { Heart, ExternalLink, ShieldAlert, BadgeCheck, Sparkles, MessageCircle } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { Sheet } from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/misc";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { ageVerdict } from "@/lib/safety/age";
import { ageFromBirthYear } from "@/lib/store";
import { cn } from "@/lib/utils";
import { oppFacts, scamTexts } from "./format";
import { OppExtraActions } from "./OppExtraActions";

/** Everything we know about one opportunity, in a pop-up panel. */
export function OpportunityDetails({
  opp,
  onClose,
  onOpen,
  pool,
}: {
  opp: Opportunity | null;
  onClose: () => void;
  /** Open a different opportunity (used by "Similar opportunities") */
  onOpen?: (o: Opportunity) => void;
  /** Other opportunities to pick similar ones from (e.g. current search results) */
  pool?: Opportunity[];
}) {
  const { t, dateLocale } = useT();
  const saved = useApp((s) => (opp ? s.saved.some((x) => x.id === opp.id) : false));
  const save = useApp((s) => s.saveOpportunity);
  const unsave = useApp((s) => s.unsave);
  const profile = useApp((s) => s.profile);
  if (!opp) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;

  const f = oppFacts(opp, t, dateLocale);
  const warnings = scamTexts(opp, t);
  const verdict = ageVerdict(opp, { age: ageFromBirthYear(profile.birthYear), grade: profile.grade });
  const rows: [string, string][] = [
    [t("opp.cost"), f.cost],
    ...(opp.cost.feeWaiver ? ([[t("opp.feeWaiver"), opp.cost.feeWaiver]] as [string, string][]) : []),
    ...(opp.paid || opp.payText ? ([[t("opp.pay"), opp.payText ?? t("common.notListed")]] as [string, string][]) : []),
    [t("opp.who"), f.whoLong],
    [t("opp.deadline"), f.deadline],
    [t("opp.when"), f.when],
    [t("opp.where"), f.where + (opp.distanceMiles !== undefined && opp.mode !== "online" ? ` (${t("opp.distance", { n: Math.round(opp.distanceMiles) })})` : "")],
    [t("opp.carFree"), f.carFree + (opp.transitNote ? ` — ${opp.transitNote}` : "")],
  ];
  const readText = [opp.title, opp.organization, opp.description, opp.whyFits, ...rows.map(([k, v]) => `${k}: ${v}`), ...warnings].filter(Boolean).join(". ");

  return (
    <Sheet open={!!opp} onClose={onClose} title={opp.title} closeLabel={t("common.close")} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="primary">
            <span aria-hidden="true">{CATEGORY_EMOJI[opp.category]}</span>
            {t(`cat.${opp.category}`)}
          </Badge>
          {opp.verified && (
            <Badge tone="success" icon={<BadgeCheck aria-hidden="true" className="size-3.5" />}>
              {t("opp.verified")}
            </Badge>
          )}
          {opp.source === "demo" && <Badge>{t("opp.sample")}</Badge>}
          <ReadAloudButton text={readText} />
        </div>
        {opp.organization && <p className="font-bold text-muted">{opp.organization}</p>}
        {opp.verified && opp.staffName && <p className="text-sm text-success">{t("opp.verifiedBy", { name: opp.staffName })}</p>}
        {opp.description && <p>{opp.description}</p>}

        {opp.whyFits && (
          <p className="flex gap-2 rounded-xl bg-primary-soft p-3 text-on-primary-soft">
            <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <span>
              <span className="font-bold">{t("opp.whyFits")}: </span>
              {opp.whyFits}
            </span>
          </p>
        )}

        {warnings.length > 0 && (
          <div className="rounded-xl border border-danger/40 bg-danger-soft p-3 text-danger">
            <p className="flex items-center gap-2 font-bold">
              <ShieldAlert aria-hidden="true" className="size-5" />
              {t("opp.scamTitle")}
            </p>
            <p className="mt-1 text-sm">{t("opp.scamIntro")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm font-bold">{t("opp.scamAdvice")}</p>
          </div>
        )}

        {verdict === "check" && <Alert tone="warning">{t("opp.checkAge")}</Alert>}
        {opp.source === "demo" && <Alert tone="info">{t("opp.sampleNote")}</Alert>}

        <dl className="divide-y divide-border rounded-xl border border-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8rem_1fr] gap-3 p-3 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="font-bold">{k}</dt>
              <dd className={cn(v === t("common.notListed") && "italic text-muted")}>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => (saved ? unsave(opp.id) : save(opp))}
            className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 font-bold", saved ? "bg-accent-soft text-on-accent-soft" : "bg-primary text-on-primary")}
          >
            <Heart aria-hidden="true" className={cn("size-4", saved && "fill-current")} />
            {saved ? t("opp.saved") : t("opp.save")}
          </button>
          {opp.sourceUrl && (
            <a
              href={opp.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-semibold shadow-xs transition-colors hover:bg-surface-2"
            >
              {t("opp.source")}
              <ExternalLink aria-hidden="true" className="size-4" />
              <span className="sr-only">{t("common.externalLink")}</span>
            </a>
          )}
          {(opp.category === "job" || opp.category === "internship" || opp.category === "scholarship" || opp.category === "summer_program") && (
            <Link
              href={`/coach?mode=interview&opp=${encodeURIComponent(opp.id)}`}
              onClick={() => {
                if (!saved) save(opp);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-semibold shadow-xs transition-colors hover:bg-surface-2"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              {t("opp.interview")}
            </Link>
          )}
        </div>
        <OppExtraActions opp={opp} onOpen={onOpen} pool={pool} />
      </div>
    </Sheet>
  );
}
