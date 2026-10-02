"use client";

import { useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { COURSES } from "@/data/courses";
import { PageHeader } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/misc";
import { BackLink, ExternalA } from "@/components/explore/common";

/** 4.1 Free skill courses matched to the student's interests and goals. */
export default function CoursesPage() {
  const { t, L } = useT();
  const profile = useApp((s) => s.profile);
  const [view, setView] = useState<"for" | "all">("for");
  const words = [...profile.interests, ...profile.goals.join(" ").toLowerCase().split(/\W+/)];
  const score = (tags: string[]) => tags.filter((x) => words.includes(x)).length;
  const sorted = [...COURSES].sort((a, b) => score(b.tags) - score(a.tags));
  const list = view === "for" ? sorted.filter((c) => score(c.tags) > 0).concat(sorted.filter((c) => score(c.tags) === 0).slice(0, 3)) : COURSES;
  return (
    <div>
      <BackLink href="/coach/practice" label={t("skills.practiceTitle")} />
      <PageHeader title={t("skills.courses")} subtitle={t("skills.coursesHelp")} />
      <div className="mb-4">
        <Segmented<"for" | "all">
          label={t("skills.courses")}
          value={view}
          onChange={setView}
          options={[
            { value: "for", label: t("skills.forYou") },
            { value: "all", label: t("skills.allCourses") },
          ]}
        />
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.name}>
            <Card className="flex h-full flex-col">
              <h2 className="font-bold">{c.name}</h2>
              <p className="flex-1 text-sm">{L(c.what)}</p>
              {c.spanish && (
                <Badge tone="primary" className="mt-2 self-start">
                  {t("skills.spanishAvailable")}
                </Badge>
              )}
              <ExternalA href={c.url}>{t("skills.open")}</ExternalA>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
