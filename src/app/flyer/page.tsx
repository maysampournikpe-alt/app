"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { makeT } from "@/i18n/translate";
import { useApp } from "@/lib/store";
import { oppFacts } from "@/components/finder/format";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/explore/common";
import { FLYER_KEY } from "@/components/finder/flyer-key";

const en = makeT("en");
const es = makeT("es");

/** 9.8 Printable flyer: any opportunity → a bilingual (English + Spanish) flyer with a QR code. */
export default function FlyerPage() {
  const { t } = useT();
  const saved = useApp((s) => s.saved);
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    let o: Opportunity | null = null;
    try {
      const raw = sessionStorage.getItem(FLYER_KEY);
      if (raw) o = JSON.parse(raw) as Opportunity;
    } catch {
      /* ignore */
    }
    const id = new URLSearchParams(window.location.search).get("id");
    if (!o && id) o = saved.find((s) => s.id === id)?.opp ?? null;
    setOpp(o);
    if (o?.sourceUrl) QRCode.toString(o.sourceUrl, { type: "svg", margin: 1, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(""));
  }, [saved]);

  if (!opp) {
    return (
      <div>
        <BackLink href="/" label={t("nav.find")} />
        <PageHeader title={t("fun.flyerTitle")} />
        <Alert tone="info">{t("fun.flyerMissing")}</Alert>
      </div>
    );
  }

  const fEn = oppFacts(opp, en, "en-US");
  const fEs = oppFacts(opp, es, "es-US");
  const rows: [string, string, string][] = [
    [`${en("opp.when")} / ${es("opp.when")}`, fEn.when, fEs.when],
    [`${en("opp.deadline")} / ${es("opp.deadline")}`, fEn.deadline, fEs.deadline],
    [`${en("opp.cost")} / ${es("opp.cost")}`, fEn.cost, fEs.cost],
    [`${en("opp.who")} / ${es("opp.who")}`, fEn.who, fEs.who],
    [`${en("opp.where")} / ${es("opp.where")}`, fEn.where, fEs.where],
  ];

  return (
    <div>
      <div className="no-print">
        <BackLink href="/" label={t("nav.find")} />
        <PageHeader title={t("fun.flyerTitle")} subtitle={t("fun.flyerHelp")} />
        <Button className="mb-4" onClick={() => window.print()} icon={<Printer aria-hidden="true" className="size-4" />}>
          {t("fun.flyerPrint")}
        </Button>
      </div>

      <article aria-label={t("fun.flyerTitle")} className="print-plain print-keep-border mx-auto max-w-2xl rounded-lg border-4 border-black bg-white p-6 text-black shadow-md">
        <p aria-hidden="true" className="text-center text-6xl">
          {CATEGORY_EMOJI[opp.category]}
        </p>
        <h2 className="mt-2 text-center text-4xl leading-tight font-black">{opp.title}</h2>
        <p className="mt-1 text-center text-xl font-bold">{opp.organization}</p>
        {opp.verified && <p className="mt-1 text-center font-bold">{en("fun.flyerVerified")} · {es("fun.flyerVerified")}</p>}
        <p className="mt-4 text-lg">{opp.description}</p>
        <dl className="mt-4 divide-y-2 divide-black border-y-2 border-black">
          {rows.map(([label, a, b]) => (
            <div key={label} className="grid grid-cols-[9rem_1fr] gap-2 py-2">
              <dt className="font-black">{label}</dt>
              <dd>
                <span lang="en">{a}</span>
                {b !== a && (
                  <span lang="es" className="block italic">
                    {b}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center gap-4">
          {qr ? (
            <>
              <span className="block size-32 shrink-0 [&>svg]:size-full" role="img" aria-label={opp.sourceUrl} dangerouslySetInnerHTML={{ __html: qr }} />
              <div>
                <p className="text-xl font-black">
                  {en("fun.flyerScan")} / <span lang="es">{es("fun.flyerScan")}</span>
                </p>
                <p className="break-all text-sm">{opp.sourceUrl}</p>
              </div>
            </>
          ) : (
            <p className="font-bold">
              {en("fun.flyerNoLink")} / <span lang="es">{es("fun.flyerNoLink")}</span>
            </p>
          )}
        </div>
        <p className="mt-4 border-t border-black pt-2 text-center text-xs">
          {en("fun.flyerFound")} <span lang="es">{es("fun.flyerFound")}</span>
        </p>
      </article>
    </div>
  );
}
