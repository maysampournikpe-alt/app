"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, BookOpen, Trophy, GraduationCap, School, Car, Star, Lock } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet, apiPost } from "@/lib/api";
import { peopleQuery, type PeopleGroup } from "@/lib/people-client";
import { PageHeader, SectionTitle, Alert, Spinner } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SchoolGroupCard } from "@/components/me/SchoolGroupCard";
import { SafetyRules } from "@/components/people/SafetyRules";
import { ClubDirectory } from "@/components/people/ClubDirectory";

const KIND_ICON = { study: BookOpen, team: Trophy, mentor: GraduationCap, school: School, carpool: Car, alumni: Star, shared_plan: Users } as const;

/** 6. People tab: group-based, moderated spaces. No private messages. */
export default function PeoplePage() {
  const { t } = useT();
  const locked = useApp((s) => s.consent.under13 && !s.parental.peopleEnabled);
  const profile = useApp((s) => s.profile);
  const [groups, setGroups] = useState<PeopleGroup[] | null>(null);
  const [failed, setFailed] = useState(false);
  const codeKey = `${profile.schoolCode}|${profile.parentCode}|${profile.mentorCode}`;

  useEffect(() => {
    if (locked) return;
    let alive = true;
    apiGet<{ groups: PeopleGroup[] }>(`/api/people/groups?${peopleQuery()}`)
      .then((r) => alive && setGroups(r.groups))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [locked, codeKey]);

  if (locked) {
    return (
      <div>
        <PageHeader title={t("nav.people")} />
        <Alert tone="info" title={t("people.locked")} />
      </div>
    );
  }

  const of = (...kinds: PeopleGroup["kind"][]) => (groups ?? []).filter((g) => kinds.includes(g.kind));

  return (
    <div className="space-y-6">
      <PageHeader title={t("nav.people")} subtitle={t("people.subtitle")} icon={<Users aria-hidden="true" className="size-6" />} />
      <SafetyRules />

      {!profile.schoolCode && !profile.parentCode && (
        <>
          <Alert tone="info">{t("people.joinToPost")}</Alert>
          <SchoolGroupCard />
        </>
      )}

      {failed && <Alert tone="warning">{t("people.error")}</Alert>}
      {!groups && !failed && <Spinner label={t("common.loading")} />}

      {groups && (
        <>
          {of("school", "carpool", "alumni").length > 0 && <GroupSection title={t("people.sectionSchool")} groups={of("school", "carpool", "alumni")} />}
          <GroupSection title={t("people.sectionStudy")} groups={of("study")} />
          <GroupSection title={t("people.sectionTeams")} groups={of("team")} />
          <GroupSection title={t("people.sectionMentors")} groups={of("mentor")} />
        </>
      )}

      <section aria-labelledby="clubs-h">
        <SectionTitle id="clubs-h">{t("people.sectionClubs")}</SectionTitle>
        <ClubDirectory />
      </section>

      <section aria-labelledby="plans-h">
        <SectionTitle id="plans-h">{t("people.sectionPlans")}</SectionTitle>
        <FollowPlanForm />
      </section>
    </div>
  );
}

function GroupSection({ title, groups }: { title: string; groups: PeopleGroup[] }) {
  const { t, L } = useT();
  const id = `sec-${title.replace(/\W+/g, "-").toLowerCase()}`;
  if (groups.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <ul className="grid gap-2 sm:grid-cols-2">
        {groups.map((g) => {
          const Icon = KIND_ICON[g.kind] ?? Users;
          return (
            <li key={g.slug}>
              <Link href={`/people/group?slug=${encodeURIComponent(g.slug)}`} className="flex h-full gap-3 rounded-2xl border-2 border-b-4 border-border bg-surface p-4 hover:border-primary">
                <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block font-bold">{L({ en: g.name, es: g.nameEs ?? g.name })}</span>
                  <span className="block text-sm text-muted">{L({ en: g.description ?? "", es: g.descEs ?? g.description ?? "" })}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <Badge>{t("people.posts", { count: g.posts })}</Badge>
                    {g.kind === "carpool" ? (
                      <Badge tone="accent" icon={<Lock aria-hidden="true" className="size-3" />}>
                        {t("people.parentsOnly")}
                      </Badge>
                    ) : (
                      g.school && (
                        <Badge tone="primary" icon={<Lock aria-hidden="true" className="size-3" />}>
                          {t("people.schoolOnly")}
                        </Badge>
                      )
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FollowPlanForm() {
  const { t } = useT();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  async function go(e: FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    try {
      await apiPost("/api/people/shared-plan", { action: "follow", code: c });
      router.push(`/people/plan?code=${encodeURIComponent(c)}`);
    } catch {
      setErr(true);
    }
  }
  return (
    <Card>
      <form onSubmit={go}>
        <Field label={t("people.planCode")} help={t("people.planHelp")}>
          {(id, d) => (
            <div className="flex gap-2">
              <Input id={id} aria-describedby={d} value={code} onChange={(e) => (setCode(e.target.value), setErr(false))} maxLength={8} autoCapitalize="characters" autoComplete="off" className="max-w-40" />
              <Button type="submit" disabled={code.trim().length < 6}>
                {t("people.followPlan")}
              </Button>
            </div>
          )}
        </Field>
        {err && (
          <Alert tone="warning" role="status" className="mt-2">
            {t("people.planNotFound")}
          </Alert>
        )}
      </form>
    </Card>
  );
}
