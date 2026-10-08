"use client";

import Link from "next/link";
import { CalendarPlus, ExternalLink, Mail } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { buildIcs, googleCalendarUrl, savedEvents } from "@/lib/calendar";
import { downloadFile } from "@/lib/utils";
import { AskParentButton } from "@/components/family/AskParentButton";
import { OppPhaseExtras } from "./OppPhaseExtras";

/** Extra actions for an opportunity: ask a parent, add to calendar, email helper, and more. */
export function OppExtraActions({ opp, onOpen, pool }: { opp: Opportunity; onOpen?: (o: Opportunity) => void; pool?: Opportunity[] }) {
  const { t } = useT();
  const save = useApp((s) => s.saveOpportunity);
  const isSaved = useApp((s) => s.saved.some((x) => x.id === opp.id));
  const events = savedEvents([{ id: opp.id, opp, status: "saved", savedAt: "", updatedAt: "" }]);
  const isScamExample = opp.tags?.includes("scam-example");
  if (isScamExample) return null;
  return (
    <div className="space-y-3 border-t border-border pt-3">
      <div className="flex flex-wrap gap-2">
        <AskParentButton opp={opp} />
        <Link
          href={`/coach?mode=email&opp=${encodeURIComponent(opp.id)}`}
          onClick={() => {
            if (!isSaved) save(opp);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 press rounded-2xl border-2 border-b-4 border-border bg-surface px-4 font-display text-sm font-extrabold hover:bg-surface-2 active:border-b-2"
        >
          <Mail aria-hidden="true" className="size-4" />
          {t("opp.emailHelp")}
        </Link>
      </div>
      {events.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={googleCalendarUrl(events[0], t("calendar.deadline"))} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 font-bold text-primary underline underline-offset-4">
            {t("calendar.google")}
            <ExternalLink aria-hidden="true" className="size-3.5" />
            <span className="sr-only">{t("common.externalLink")}</span>
          </a>
          <button
            type="button"
            onClick={() => downloadFile("rumbo-event.ics", buildIcs(events, { deadline: t("calendar.deadline"), reminder: t("calendar.reminder") }), "text/calendar")}
            className="inline-flex min-h-10 items-center gap-1 font-bold text-primary underline underline-offset-4"
          >
            <CalendarPlus aria-hidden="true" className="size-4" />
            {t("calendar.addOne")}
          </button>
        </div>
      )}
      <OppPhaseExtras opp={opp} onOpen={onOpen} pool={pool} />
    </div>
  );
}
