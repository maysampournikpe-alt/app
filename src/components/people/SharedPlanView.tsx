"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import type { Horizon } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { uid } from "@/lib/utils";
import { sendPost, type PeoplePost } from "@/lib/people-client";
import { PageHeader, Alert, Spinner, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BackLink } from "@/components/explore/common";
import { CHEERS } from "@/data/cheers";

interface Shared {
  code: string;
  followers: number;
  plan: { goal: string; summary?: string; milestones: { title: string; horizon: Horizon; detail?: string; searchQuery?: string }[] };
}


export function SharedPlanView({ code }: { code: string }) {
  const { t, locale } = useT();
  const addPlan = useApp((s) => s.addPlan);
  const [data, setData] = useState<Shared | null>(null);
  const [cheers, setCheers] = useState<PeoplePost[]>([]);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const slug = `plan-${code.toLowerCase()}`;

  const loadCheers = useCallback(async () => {
    const r = await apiGet<{ posts: PeoplePost[] }>(`/api/people/posts?slug=${encodeURIComponent(slug)}`).catch(() => null);
    if (r) setCheers(r.posts);
  }, [slug]);

  useEffect(() => {
    apiGet<Shared>(`/api/people/shared-plan?code=${encodeURIComponent(code)}`)
      .then(setData)
      .catch(() => setMissing(true));
    void loadCheers();
  }, [code, loadCheers]);

  const presets = locale === "es" ? CHEERS.es : CHEERS.en;

  return (
    <div className="space-y-4">
      <BackLink href="/people" label={t("people.back")} />
      {missing && (
        <>
          <PageHeader title={t("people.sectionPlans")} />
          <Alert tone="warning">{t("people.planNotFound")}</Alert>
        </>
      )}
      {!data && !missing && <Spinner label={t("common.loading")} />}
      {data && (
        <>
          <PageHeader title={data.plan.goal} subtitle={data.plan.summary} />
          <p className="flex items-center gap-2 text-sm text-muted">
            <Users aria-hidden="true" className="size-4" />
            {t("people.followers", { count: data.followers })} · {t("people.planCode")}: <span className="font-mono font-bold">{data.code}</span>
          </p>
          <Card>
            <ol className="list-decimal space-y-1 pl-6">
              {data.plan.milestones.map((m, i) => (
                <li key={i}>
                  <span className="font-bold">{m.title}</span>
                  {m.detail && <span className="block text-sm text-muted">{m.detail}</span>}
                </li>
              ))}
            </ol>
            <Button
              variant="soft"
              className="mt-3"
              disabled={copied}
              icon={<Copy aria-hidden="true" className="size-4" />}
              onClick={() => {
                addPlan({ goal: data.plan.goal, summary: data.plan.summary, source: "template", sharedCode: data.code, milestones: data.plan.milestones.map((m) => ({ ...m, id: uid(), done: false })) });
                setCopied(true);
              }}
            >
              {copied ? t("people.copied") : t("people.copyPlan")}
            </Button>
          </Card>

          <section aria-labelledby="cheers-h">
            <SectionTitle id="cheers-h">{t("people.cheersTitle")}</SectionTitle>
            <div role="group" aria-label={t("people.sendCheer")} className="mb-3 flex flex-wrap gap-2">
              {presets.map((c) => (
                <Chip
                  key={c}
                  size="sm"
                  onClick={async () => {
                    await sendPost({ action: "post", slug, kind: "cheer", body: c });
                    void loadCheers();
                  }}
                >
                  {c}
                </Chip>
              ))}
            </div>
            {cheers.length === 0 ? (
              <p className="text-muted">{t("people.noCheers")}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {cheers.map((c) => (
                  <li key={c.id} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                    {c.body} <span className="text-muted">— {c.nickname}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
