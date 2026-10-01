"use client";

import Link from "next/link";
import { Bus } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { similarTo } from "@/lib/similar";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { Reviews } from "./Reviews";
import { MoreOppActions } from "./MoreOppActions";

/** Discovery extras in the details panel: getting there, reviews, similar opportunities. */
export function OppPhaseExtras({ opp, onOpen, pool }: { opp: Opportunity; onOpen?: (o: Opportunity) => void; pool?: Opportunity[] }) {
  const { t } = useT();
  const saved = useApp((s) => s.saved);
  const lowData = useApp((s) => s.settings.lowData);
  const candidates = [...(pool ?? []), ...saved.map((s) => s.opp)];
  const similar = onOpen ? similarTo(opp, candidates) : [];
  return (
    <div className="space-y-4">
      <MoreOppActions opp={opp} />
      {opp.mode !== "online" && (
        <Link href="/explore/transport" className="flex items-center gap-2 rounded-xl bg-surface-2 p-3 hover:underline">
          <Bus aria-hidden="true" className="size-5 text-primary" />
          <span>
            <span className="block font-bold">{t("explore.gettingThere")}</span>
            <span className="text-sm text-muted">{t("explore.gettingThereHelp")}</span>
          </span>
        </Link>
      )}
      {!lowData && <Reviews opp={opp} />}
      {similar.length > 0 && (
        <section aria-labelledby={`sim-${opp.id}`}>
          <h3 id={`sim-${opp.id}`} className="mb-2 font-bold">
            {t("explore.similar")}
          </h3>
          <ul className="space-y-2">
            {similar.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onOpen?.(o)} className="w-full rounded-xl border border-border p-3 text-left hover:border-primary">
                  <span className="block font-bold">
                    <span aria-hidden="true">{CATEGORY_EMOJI[o.category]}</span> {o.title}
                  </span>
                  <span className="text-sm text-muted">{o.organization}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
