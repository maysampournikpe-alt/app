"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useT } from "@/i18n/useT";
import { CAREERS, RIASEC_INFO, careerProfileUrl, type Career, type Riasec } from "@/data/careers";
import { PageHeader } from "@/components/ui/misc";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { BackLink, ExternalA, useRunSearch } from "@/components/explore/common";

/** 3.2.1 Career explorer + 3.2.3 day-in-the-life videos. */
export default function CareersPage() {
  const { t, L, dateLocale } = useT();
  const [filter, setFilter] = useState<Riasec | null>(null);
  const [open, setOpen] = useState<Career | null>(null);
  const runSearch = useRunSearch();
  const list = filter ? CAREERS.filter((c) => c.codes.includes(filter)) : CAREERS;
  const money = (n: number) => n.toLocaleString(dateLocale);

  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.careers")} subtitle={t("explore.careersSub")} />
      <div role="group" aria-label={t("explore.filterCareers")} className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        <Chip size="sm" selected={!filter} onClick={() => setFilter(null)}>
          {t("explore.allCareers")}
        </Chip>
        {(Object.keys(RIASEC_INFO) as Riasec[]).map((k) => (
          <Chip key={k} size="sm" selected={filter === k} onClick={() => setFilter(k)} icon={<span aria-hidden="true">{RIASEC_INFO[k].emoji}</span>}>
            {L(RIASEC_INFO[k].name).split(" (")[0]}
          </Chip>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => setOpen(c)} className="flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm hover:border-primary">
              <span aria-hidden="true" className="text-3xl">
                {c.emoji}
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{L(c.title)}</span>
                <span className="block text-sm text-muted">
                  {t("explore.pay")}: {c.payNote ? L(c.payNote) : t("explore.payN", { n: money(c.pay) })}
                </span>
                <span className="block text-sm text-muted">
                  {t("explore.time")}: {L(c.years)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{t("explore.payNote")}</p>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `${open.emoji} ${L(open.title)}` : ""} closeLabel={t("common.close")}>
        {open && (
          <div className="space-y-3">
            <ReadAloudButton text={[L(open.title), L(open.day), L(open.education), L(open.startNow)].join(". ")} />
            <dl className="space-y-3">
              {(
                [
                  ["explore.pay", open.payNote ? L(open.payNote) : t("explore.payN", { n: money(open.pay) })],
                  ["explore.education", L(open.education)],
                  ["explore.time", L(open.years)],
                  ["explore.typicalDay", L(open.day)],
                  ["explore.startNow", L(open.startNow)],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-bold">{t(k)}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">{t("explore.payNote")}</p>
            <div className="flex flex-wrap gap-2">
              <ExternalA href={careerProfileUrl(open)}>{t("explore.watchVideo")}</ExternalA>
            </div>
            <Button full icon={<Search aria-hidden="true" className="size-4" />} onClick={() => runSearch(L(open.search))}>
              {t("explore.findOpps")}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
