"use client";

import { Search } from "lucide-react";
import { useT } from "@/i18n/useT";
import { CAREERS, careerProfileUrl } from "@/data/careers";
import { COLLEGES } from "@/data/explore";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink, ExternalA, useRunSearch } from "@/components/explore/common";

const TRADE_IDS = ["welder", "hvac", "electrician", "autotech", "cna", "trucker", "paralegal", "software"];

/** 3.2.8 Trade and certification paths. */
export default function TradesPage() {
  const { t, L } = useT();
  const runSearch = useRunSearch();
  const trades = TRADE_IDS.map((id) => CAREERS.find((c) => c.id === id)!).filter(Boolean);
  const schools = COLLEGES.filter((c) => c.rgv && (c.type === "technical" || c.type === "community"));
  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.trades")} subtitle={t("explore.tradesSub")} />
      <p className="mb-4">{t("explore.tradesIntro")}</p>
      <ul className="space-y-3">
        {trades.map((c) => (
          <li key={c.id}>
            <Card>
              <h2 className="text-lg font-bold">
                <span aria-hidden="true">{c.emoji}</span> {L(c.title)}
              </h2>
              <p className="text-sm">{L(c.day)}</p>
              <dl className="mt-2 grid grid-cols-[8rem_1fr] gap-1 text-sm">
                <dt className="font-bold">{t("explore.education")}</dt>
                <dd>{L(c.education)}</dd>
                <dt className="font-bold">{t("explore.time")}</dt>
                <dd>{L(c.years)}</dd>
                <dt className="font-bold">{t("explore.pay")}</dt>
                <dd>{t("explore.payN", { n: c.pay.toLocaleString() })}</dd>
              </dl>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button size="sm" variant="soft" icon={<Search aria-hidden="true" className="size-4" />} onClick={() => runSearch(L(c.search))}>
                  {t("explore.findOpps")}
                </Button>
                <ExternalA href={careerProfileUrl(c)}>{t("explore.watchVideo")}</ExternalA>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <SectionTitle>{t("explore.trainingPrograms")}</SectionTitle>
      <ul className="space-y-2">
        {schools.map((s) => (
          <li key={s.id}>
            <Card>
              <p className="font-bold">{s.name}</p>
              <p className="text-sm">{L(s.note)}</p>
              <ExternalA href={s.url}>{t("explore.visit")}</ExternalA>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">{t("explore.payNote")}</p>
    </div>
  );
}
