"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { schoolYearOf, yearReview } from "@/lib/fun";
import { formatDate } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Avatar } from "@/components/me/Avatar";
import { BackLink } from "@/components/explore/common";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";

/** 9.5 Year in review: a printable summary of the school year. */
export default function YearPage() {
  const { t, dateLocale } = useT();
  const s = useApp();
  const current = schoolYearOf();
  const [year, setYear] = useState(current);
  const r = yearReview(s, year);
  const tiles: [string, number, string][] = [
    ["yearXp", r.xp, "✨"],
    ["yearApplied", r.applied, "📝"],
    ["yearAccepted", r.accepted, "🎉"],
    ["yearHours", r.hours, "🤝"],
    ["yearSteps", r.steps, "✅"],
    ["yearPlans", r.plans, "🏁"],
    ["yearDaily", r.daily, "🧩"],
    ["yearTests", r.tests, "✏️"],
    ["yearBadges", r.badges, "🏅"],
  ];
  const headline = s.profile.nickname ? t("fun.yearHeadline", { name: s.profile.nickname }) : t("fun.yearHeadlineAnon");
  const monthName = r.topMonth ? new Date(`${r.topMonth.month}-02T12:00:00`).toLocaleDateString(dateLocale, { month: "long", year: "numeric" }) : "";
  const spoken = [headline, ...tiles.filter(([, n]) => n > 0).map(([k, n]) => `${t(`fun.${k}`)}: ${n}`), r.topMonth ? t("fun.yearTopMonth", { month: monthName, hours: r.topMonth.hours }) : ""].join(". ");

  return (
    <div>
      <div className="no-print">
        <BackLink href="/me/progress" label={t("progress.title")} />
        <PageHeader title={t("fun.yearTitle")} subtitle={t("fun.yearSub")} />
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="year" className="block text-sm font-bold">
              {t("fun.yearPick")}
            </label>
            <Select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-auto">
              {[current, current - 1, current - 2].map((y) => (
                <option key={y} value={y}>
                  {t("fun.yearSchool")} {y}–{String(y + 1).slice(2)}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={() => window.print()} icon={<Printer aria-hidden="true" className="size-4" />}>
            {t("fun.yearPrint")}
          </Button>
          <ReadAloudButton text={spoken} />
        </div>
      </div>

      <article aria-labelledby="yr-h" className="print-plain rounded-3xl border border-border bg-gradient-to-br from-primary-soft to-accent-soft p-5">
        <div className="flex items-center gap-4">
          <Avatar config={s.avatar} size="lg" />
          <div>
            <h2 id="yr-h" className="text-2xl font-bold">
              {headline}
            </h2>
            <p className="text-sm">{t("fun.yearRange", { from: formatDate(r.from, dateLocale), to: formatDate(r.to, dateLocale) })}</p>
          </div>
        </div>
        {r.empty ? (
          <Alert tone="info" className="mt-4">
            {t("fun.yearEmpty")}
          </Alert>
        ) : (
          <>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {tiles.map(([k, n, e]) => (
                <li key={k} className="rounded-2xl bg-surface p-3 text-center">
                  <span aria-hidden="true" className="block text-2xl">
                    {e}
                  </span>
                  <span className="block text-2xl font-bold">{n}</span>
                  <span className="block text-xs font-bold text-muted">{t(`fun.${k}`)}</span>
                </li>
              ))}
            </ul>
            {r.topMonth && <p className="mt-3 font-bold">🌟 {t("fun.yearTopMonth", { month: monthName, hours: r.topMonth.hours })}</p>}
            {r.accomplishments.length > 0 && (
              <>
                <h3 className="mt-4 font-bold">{t("fun.yearAccomplishments")}</h3>
                <ul className="list-disc pl-6">
                  {r.accomplishments.map((a) => (
                    <li key={a.id}>{a.title}</li>
                  ))}
                </ul>
              </>
            )}
            {r.certs.length > 0 && (
              <>
                <h3 className="mt-4 font-bold">{t("fun.yearCerts")}</h3>
                <ul className="list-disc pl-6">
                  {r.certs.map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </article>

      <SectionTitle>{t("fun.yearNext")}</SectionTitle>
      <Card>
        <ul className="list-disc space-y-1 pl-6">
          <li>{t("fun.yearNext1")}</li>
          <li>{t("fun.yearNext2")}</li>
          <li>{t("fun.yearNext3")}</li>
        </ul>
      </Card>
    </div>
  );
}
