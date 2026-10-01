"use client";

import { Search, HandCoins, Wifi, Backpack } from "lucide-react";
import { useT } from "@/i18n/useT";
import { FEE_WAIVERS, FREE_GEAR, FREE_INTERNET, WIFI_SAFETY, type Resource } from "@/data/money";
import { PageHeader, SectionTitle, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink, ExternalA, useRunSearch } from "@/components/explore/common";

function List({ items }: { items: Resource[] }) {
  const { t, L } = useT();
  return (
    <ul className="space-y-2">
      {items.map((r, i) => (
        <li key={i}>
          <Card>
            <h3 className="font-bold">{L(r.name)}</h3>
            <p className="text-sm">{L(r.what)}</p>
            {r.url && <ExternalA href={r.url}>{t("explore.visit")}</ExternalA>}
          </Card>
        </li>
      ))}
    </ul>
  );
}

/** Phase 8: fee waiver finder, free gear and supplies, free internet. */
export default function MoneyPage() {
  const { t, L } = useT();
  const runSearch = useRunSearch();
  const sections = [
    { id: "fees", icon: HandCoins, title: t("money.feesTitle"), help: t("money.feesHelp"), items: FEE_WAIVERS, q: t("money.feesSearch") },
    { id: "gear", icon: Backpack, title: t("money.gearTitle"), help: t("money.gearHelp"), items: FREE_GEAR, q: t("money.gearSearch") },
    { id: "net", icon: Wifi, title: t("money.netTitle"), help: t("money.netHelp"), items: FREE_INTERNET, q: t("money.netSearch") },
  ];
  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.money")} subtitle={t("money.intro")} />
      {sections.map(({ id, icon: Icon, title, help, items, q }) => (
        <section key={id} aria-labelledby={`m-${id}`}>
          <SectionTitle id={`m-${id}`}>
            <span className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-5 text-primary" />
              {title}
            </span>
          </SectionTitle>
          <p className="-mt-2 mb-3 text-sm text-muted">{help}</p>
          <List items={items} />
          <Button variant="soft" className="mt-3" icon={<Search aria-hidden="true" className="size-4" />} onClick={() => runSearch(q)}>
            {t("money.searchNear")}: {q}
          </Button>
        </section>
      ))}
      <Alert className="mt-6" tone="info" title={t("money.safeTitle")}>
        {L(WIFI_SAFETY)}
      </Alert>
    </div>
  );
}
