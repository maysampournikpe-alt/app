"use client";

import { Bus, Phone } from "lucide-react";
import { useT } from "@/i18n/useT";
import { TRANSIT, RIDE_TIPS } from "@/data/explore";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { BackLink, ExternalA } from "@/components/explore/common";

/** 3.1.10 Transportation info and ride options. */
export default function TransportPage() {
  const { t, L } = useT();
  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.transport")} subtitle={t("explore.transportSub")} icon={<Bus className="size-7" />} />
      <SectionTitle>{t("explore.transitTitle")}</SectionTitle>
      <ul className="space-y-3">
        {TRANSIT.map((s) => (
          <li key={s.id}>
            <Card>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm">{L(s.area)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4">
                <ExternalA href={s.url}>{t("explore.visit")}</ExternalA>
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/[^\d]/g, "")}`} className="inline-flex min-h-10 items-center gap-1 font-bold text-primary underline underline-offset-4">
                    <Phone aria-hidden="true" className="size-4" />
                    {t("explore.call", { n: s.phone })}
                  </a>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <SectionTitle>{t("explore.rideTips")}</SectionTitle>
      <ul className="list-disc space-y-2 pl-5">
        {RIDE_TIPS.map((tip, i) => (
          <li key={i}>{L(tip)}</li>
        ))}
      </ul>
    </div>
  );
}
