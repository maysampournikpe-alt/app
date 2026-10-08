"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ListChecks } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { runTask } from "@/lib/api";
import { toMilestones, planProgress } from "@/lib/plan-utils";
import type { PlanOutputT } from "@/lib/server/tasks/plan-types";
import { GOAL_TEMPLATES } from "@/data/goal-templates";
import { GRADES } from "@/data/interests";
import { PageHeader, SectionTitle, ProgressBar, EmptyState, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CrisisHelp } from "@/components/safety/CrisisHelp";
import { PlanTools } from "@/components/plan/PlanTools";

/** 1.3 Plan Builder: list of plans, a form for a new goal, and ready-made templates. */
export default function PlanPage() {
  const { t, L } = useT();
  const router = useRouter();
  const plans = useApp((s) => s.plans);
  const profile = useApp((s) => s.profile);
  const addPlan = useApp((s) => s.addPlan);
  const [goal, setGoal] = useState("");
  const [grade, setGrade] = useState<number | undefined>(profile.grade);
  const [hours, setHours] = useState(4);
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (goal.trim().length < 2) return;
    setBusy(true);
    setError(false);
    try {
      const res = await runTask<PlanOutputT>("plan-create", { goal: goal.trim(), grade, hoursPerWeek: hours });
      if (res.crisis) return setCrisis(true);
      if (!res.output) return setError(true);
      const id = addPlan({ goal: goal.trim(), grade, hoursPerWeek: hours, summary: res.output.summary, milestones: toMilestones(res.output.milestones), source: res.demo ? "demo" : "ai" });
      router.push(`/plan/view?id=${id}`);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  function applyTemplate(id: string) {
    const tpl = GOAL_TEMPLATES.find((x) => x.id === id)!;
    const planId = addPlan({
      goal: L(tpl.title),
      grade: profile.grade,
      templateId: tpl.id,
      summary: L(tpl.summary),
      source: "template",
      milestones: toMilestones(tpl.steps.map((s) => ({ title: L(s.t), detail: s.d ? L(s.d) : "", horizon: s.h, searchQuery: s.q ? L(s.q) : null, done: false }))),
    });
    router.push(`/plan/view?id=${planId}`);
  }

  return (
    <div>
      <PageHeader title={t("plan.title")} subtitle={t("plan.subtitle")} />

      {plans.length > 0 && (
        <section aria-labelledby="my-plans" className="mb-6">
          <SectionTitle id="my-plans">{t("plan.myPlans")}</SectionTitle>
          <ul className="space-y-3">
            {plans.map((p) => {
              const pr = planProgress(p);
              return (
                <li key={p.id}>
                  <Link href={`/plan/view?id=${p.id}`} className="block rounded-2xl border-2 border-b-4 border-border bg-surface p-4 hover:border-primary">
                    <span className="flex items-center gap-2 font-bold">
                      <ListChecks aria-hidden="true" className="size-5 text-primary" />
                      {p.goal}
                    </span>
                    <span className="mt-2 block text-sm text-muted">{t("plan.stepsDone", { done: pr.done, total: pr.total })}</span>
                    <ProgressBar value={pr.pct} label={`${t("plan.progress")}: ${p.goal}`} className="mt-1.5" tone={pr.pct === 1 ? "success" : "primary"} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Sparkles aria-hidden="true" className="size-5 text-primary" />
          {t("plan.newPlan")}
        </h2>
        <form onSubmit={create} className="space-y-4">
          <Field label={t("plan.goal")}>
            {(id) => <Input id={id} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t("plan.goalPlaceholder")} maxLength={200} required />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("plan.grade")}>
              {(id) => (
                <Select id={id} value={grade ?? ""} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">—</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {t("common.gradeN", { n: g })}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t("plan.hours")} help={t("plan.hoursN", { count: hours })}>
              {(id, d) => <input id={id} aria-describedby={d} type="range" min={1} max={20} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="h-11 w-full accent-[var(--primary)]" />}
            </Field>
          </div>
          {crisis && <CrisisHelp />}
          {error && <Alert tone="danger">{t("common.error")}</Alert>}
          <Button type="submit" full disabled={busy || goal.trim().length < 2}>
            {busy ? t("plan.creating") : t("plan.create")}
          </Button>
        </form>
      </Card>

      <section aria-labelledby="templates">
        <SectionTitle id="templates">{t("plan.templates")}</SectionTitle>
        <p className="-mt-2 mb-3 text-sm text-muted">{t("plan.templatesHelp")}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {GOAL_TEMPLATES.map((tpl) => (
            <li key={tpl.id} className="flex flex-col rounded-2xl border-2 border-b-4 border-border bg-surface p-4">
              <p className="flex items-center gap-2 font-bold">
                <span aria-hidden="true" className="text-2xl">
                  {tpl.emoji}
                </span>
                {L(tpl.title)}
              </p>
              <p className="mt-1 flex-1 text-sm text-muted">{L(tpl.summary)}</p>
              <Button variant="soft" size="sm" className="mt-3 self-start" onClick={() => applyTemplate(tpl.id)}>
                {t("plan.useTemplate")}
                <span className="sr-only">: {L(tpl.title)}</span>
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {plans.length === 0 && (
        <div className="mt-6">
          <EmptyState icon="🗺️" title={t("plan.noPlans")} body={t("plan.noPlansHelp")} />
        </div>
      )}

      <PlanTools />
    </div>
  );
}
