"use client";

import { useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { COLLEGES } from "@/data/explore";
import { PageHeader, Alert, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { BackLink, ExternalA } from "@/components/explore/common";

/** 3.2.4 College finder matched to interests and budget, starting with the Valley. */
export default function CollegesPage() {
  const { t, L } = useT();
  const interests = useApp((s) => s.profile.interests);
  const [budget, setBudget] = useState(0);
  const [rgvOnly, setRgvOnly] = useState(false);
  const [matchInterests, setMatchInterests] = useState(interests.length > 0);
  const list = COLLEGES.filter((c) => (!budget || c.cost <= budget) && (!rgvOnly || c.rgv) && (!matchInterests || !interests.length || c.strengths.some((s) => interests.includes(s)))).sort(
    (a, b) => Number(b.rgv) - Number(a.rgv) || a.cost - b.cost,
  );
  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.colleges")} subtitle={t("explore.collegesSub")} />
      <Card className="mb-4 space-y-2">
        <Field label={t("explore.budget")}>
          {(id) => (
            <Select id={id} value={budget} onChange={(e) => setBudget(Number(e.target.value))}>
              <option value={0}>{t("explore.budgetAny")}</option>
              <option value={1}>{t("explore.budget1")}</option>
              <option value={2}>{t("explore.budget2")}</option>
              <option value={3}>{t("explore.budget3")}</option>
            </Select>
          )}
        </Field>
        <Toggle checked={rgvOnly} onChange={setRgvOnly} label={t("explore.nearOnly")} />
        {interests.length > 0 && <Toggle checked={matchInterests} onChange={setMatchInterests} label={t("explore.matchInterests")} />}
      </Card>
      <Alert className="mb-4">{t("explore.costNote")}</Alert>
      {list.length === 0 ? (
        <EmptyState icon="🏫" title={t("explore.noColleges")} />
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">{t(`explore.type_${c.type}`)}</Badge>
                  <Badge tone={c.cost === 1 ? "success" : c.cost === 2 ? "neutral" : "warning"}>{"$".repeat(c.cost)}</Badge>
                  {c.rgv && <Badge tone="accent">RGV</Badge>}
                </div>
                <h2 className="mt-2 text-lg font-bold">{c.name}</h2>
                <p className="text-sm text-muted">{c.city}</p>
                <p className="mt-1 text-sm">{L(c.note)}</p>
                <div className="mt-2 flex flex-wrap gap-x-4">
                  <ExternalA href={c.url}>{t("explore.visit")}</ExternalA>
                  <ExternalA href={`https://collegescorecard.ed.gov/search/?search=${encodeURIComponent(c.name.split(" (")[0])}`}>{t("explore.scorecard")}</ExternalA>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
