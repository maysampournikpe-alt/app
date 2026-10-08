"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Trash2, Wand2, Check } from "lucide-react";
import type { Horizon, Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { runTask } from "@/lib/api";
import { useFinder } from "@/lib/finder-client";
import { toMilestones, planProgress, relatedSaved } from "@/lib/plan-utils";
import type { PlanOutputT } from "@/lib/server/tasks/plan-types";
import { cn } from "@/lib/utils";
import { PageHeader, ProgressBar, SectionTitle, Alert, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { OpportunityCard } from "@/components/finder/OpportunityCard";
import { OpportunityDetails } from "@/components/finder/OpportunityDetails";
import { CrisisHelp } from "@/components/safety/CrisisHelp";
import { PlanExtras } from "@/components/plan/PlanExtras";

const HORIZONS: Horizon[] = ["week", "month", "year"];

function PlanView() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const plan = useApp((s) => s.plans.find((p) => p.id === id));
  const saved = useApp((s) => s.saved);
  const toggle = useApp((s) => s.toggleMilestone);
  const replace = useApp((s) => s.replaceMilestones);
  const deletePlan = useApp((s) => s.deletePlan);
  const [request, setRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error" | "crisis">("idle");
  const [open, setOpen] = useState<Opportunity | null>(null);

  if (!plan) {
    return (
      <div>
        <Link href="/plan" className="mb-4 inline-flex items-center gap-1 font-bold text-primary">
          <ArrowLeft aria-hidden="true" className="size-4" /> {t("plan.back")}
        </Link>
        <EmptyState icon="🧭" title={t("plan.notFound")} />
      </div>
    );
  }

  const pr = planProgress(plan);
  const related = relatedSaved(plan, saved);

  function findFor(q: string) {
    const f = useFinder.getState();
    f.setQuery(q);
    void f.search(q);
    router.push("/");
  }

  async function adjust(e: FormEvent) {
    e.preventDefault();
    if (!plan || request.trim().length < 2) return;
    setBusy(true);
    setStatus("idle");
    try {
      const res = await runTask<PlanOutputT>("plan-adjust", {
        goal: plan.goal,
        request: request.trim(),
        hoursPerWeek: plan.hoursPerWeek,
        milestones: plan.milestones.map((m) => ({ title: m.title, horizon: m.horizon, done: m.done })),
      });
      if (res.crisis) return setStatus("crisis");
      if (!res.output) return setStatus("error");
      replace(plan.id, toMilestones(res.output.milestones), res.output.summary);
      setRequest("");
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  const readText = [plan.goal, plan.summary, ...HORIZONS.flatMap((h) => [t(`plan.${h}`), ...plan.milestones.filter((m) => m.horizon === h).map((m) => m.title)])].filter(Boolean).join(". ");

  return (
    <div>
      <Link href="/plan" className="mb-4 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("plan.back")}
      </Link>
      <PageHeader title={plan.goal} subtitle={plan.summary} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ReadAloudButton text={readText} />
      </div>
      {plan.source === "demo" && <Alert className="mb-4">{t("plan.demoNote")}</Alert>}

      <Card className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold">{t("plan.progress")}</p>
          <p className="text-sm font-bold text-muted">{t("plan.stepsDone", { done: pr.done, total: pr.total })}</p>
        </div>
        <ProgressBar value={pr.pct} label={t("plan.progress")} className="mt-2 h-4" tone={pr.pct === 1 ? "success" : "primary"} />
        {pr.pct === 1 && <p className="mt-2 font-bold text-success">{t("plan.complete")}</p>}
      </Card>

      {HORIZONS.map((h) => {
        const items = plan.milestones.filter((m) => m.horizon === h);
        if (!items.length) return null;
        return (
          <section key={h} aria-labelledby={`h-${h}`} className="mb-4">
            <SectionTitle id={`h-${h}`}>{t(`plan.${h}`)}</SectionTitle>
            <ul className="space-y-2">
              {items.map((m) => (
                <li key={m.id} className={cn("rounded-xl border bg-surface p-3", m.done ? "border-success/40" : "border-border")}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={m.done}
                      aria-label={t("plan.markDone", { title: m.title })}
                      onClick={() => toggle(plan.id, m.id)}
                      className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border-2", m.done ? "border-success bg-success text-white dark:text-black" : "border-border bg-surface hover:border-primary")}
                    >
                      {m.done && <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-bold", m.done && "text-muted line-through")}>{m.title}</p>
                      {m.detail && <p className="text-sm text-muted">{m.detail}</p>}
                      {m.searchQuery && !m.done && (
                        <button type="button" onClick={() => findFor(m.searchQuery!)} className="mt-1 inline-flex min-h-9 items-start gap-1 text-left text-sm font-bold text-primary underline underline-offset-4">
                          <Search aria-hidden="true" className="size-4" />
                          {t("plan.findFor", { q: m.searchQuery })}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section aria-labelledby="linked" className="mb-4">
        <SectionTitle id="linked">{t("plan.linked")}</SectionTitle>
        {related.length ? (
          <ul className="space-y-3">
            {related.map((s) => (
              <li key={s.id}>
                <OpportunityCard opp={s.opp} onOpen={setOpen} compact />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("plan.linkedEmpty")}</p>
        )}
        <Button variant="soft" className="mt-3" icon={<Search aria-hidden="true" className="size-4" />} onClick={() => findFor(plan.goal)}>
          {t("plan.find")}
        </Button>
      </section>

      <Card className="mb-4">
        <form onSubmit={adjust} className="space-y-3">
          <label htmlFor="adjust" className="flex items-center gap-2 font-bold">
            <Wand2 aria-hidden="true" className="size-5 text-primary" />
            {t("plan.adjust")}
          </label>
          <Textarea id="adjust" value={request} onChange={(e) => setRequest(e.target.value)} placeholder={t("plan.adjustPlaceholder")} maxLength={500} className="min-h-20" />
          {status === "done" && <Alert tone="success" role="status">{t("plan.adjusted")}</Alert>}
          {status === "error" && <Alert tone="danger">{t("common.error")}</Alert>}
          {status === "crisis" && <CrisisHelp />}
          <Button type="submit" disabled={busy || request.trim().length < 2}>
            {busy ? t("plan.adjusting") : t("plan.adjustButton")}
          </Button>
        </form>
      </Card>

      <PlanExtras plan={plan} />

      <Button
        variant="ghost"
        className="text-danger"
        icon={<Trash2 aria-hidden="true" className="size-4" />}
        onClick={() => {
          if (window.confirm(t("plan.deleteConfirm"))) {
            deletePlan(plan.id);
            router.push("/plan");
          }
        }}
      >
        {t("plan.delete")}
      </Button>

      <OpportunityDetails opp={open} onClose={() => setOpen(null)} />
    </div>
  );
}

export default function PlanViewPage() {
  return (
    <Suspense>
      <PlanView />
    </Suspense>
  );
}
