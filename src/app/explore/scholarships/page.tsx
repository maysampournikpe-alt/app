"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { KNOWN_SCHOLARSHIPS } from "@/data/explore";
import { GRADES } from "@/data/interests";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { BackLink, ExternalA, useRunSearch } from "@/components/explore/common";
import { useFinder } from "@/lib/finder-client";

/** 3.2.6 Scholarship matcher filtered by grade, interests, location, and first-generation status. */
export default function ScholarshipsPage() {
  const { t, L, locale } = useT();
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const [grade, setGrade] = useState(profile.grade ?? 12);
  const [firstGen, setFirstGen] = useState(!!profile.firstGen);
  const [hispanic, setHispanic] = useState(false);
  const [need, setNeed] = useState(false);
  const runSearch = useRunSearch();

  function search() {
    setProfile({ firstGen });
    const es = locale === "es";
    const interests = profile.interests.slice(0, 2).map((i) => t(`interests.${i}`).toLowerCase());
    const parts = es
      ? ["becas para estudiantes de", `${grade}.º grado`, firstGen && "de primera generación", hispanic && "hispanos", need && "con necesidad económica", interests.length && `interesados en ${interests.join(" y ")}`, "en Texas"]
      : ["scholarships for", `grade ${grade}`, firstGen && "first-generation", hispanic && "Hispanic", need && "low-income", "students", interests.length && `interested in ${interests.join(" and ")}`, "in Texas"];
    useFinder.getState().setFilters({ category: "scholarship" });
    runSearch(parts.filter(Boolean).join(" "));
  }

  const tags = [firstGen && "first-gen", hispanic && "hispanic", need && "need"].filter(Boolean) as string[];
  const known = [...KNOWN_SCHOLARSHIPS].sort((a, b) => b.tags.filter((x) => tags.includes(x)).length - a.tags.filter((x) => tags.includes(x)).length);

  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.scholarships")} subtitle={t("explore.scholarshipsSub")} />
      <Card className="space-y-2">
        <h2 className="font-bold">{t("explore.schMatchTitle")}</h2>
        <Field label={t("explore.schGrade")}>
          {(id) => (
            <Select id={id} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {t("common.gradeN", { n: g })}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Toggle checked={firstGen} onChange={setFirstGen} label={t("explore.schFirstGen")} />
        <Toggle checked={hispanic} onChange={setHispanic} label={t("explore.schHispanic")} />
        <Toggle checked={need} onChange={setNeed} label={t("explore.schNeed")} />
        <Button full icon={<Search aria-hidden="true" className="size-4" />} onClick={search}>
          {t("explore.schSearch")}
        </Button>
      </Card>

      <SectionTitle>{t("explore.schKnown")}</SectionTitle>
      <p className="-mt-2 mb-3 text-sm text-muted">{t("explore.schKnownHelp")}</p>
      <ul className="space-y-3">
        {known.map((s) => (
          <li key={s.name}>
            <Card>
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm">{L(s.who)}</p>
              <p className="text-sm text-muted">{L(s.when)}</p>
              <ExternalA href={s.url}>{t("explore.visit")}</ExternalA>
            </Card>
          </li>
        ))}
      </ul>

      <SectionTitle>{t("explore.schTips")}</SectionTitle>
      <ul className="list-disc space-y-1 pl-5">
        <li>{t("explore.schTip1")}</li>
        <li>{t("explore.schTip2")}</li>
        <li>{t("explore.schTip3")}</li>
      </ul>
    </div>
  );
}
