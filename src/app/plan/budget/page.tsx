"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import type { BudgetEntry } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { formatDate, todayISO, uid } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert, Segmented, ProgressBar, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/explore/common";
import { cn } from "@/lib/utils";

/** 5.2 Budget planner for students with jobs: earnings, spending, and savings goals. */
export default function BudgetPage() {
  const { t, dateLocale } = useT();
  const entries = useApp((s) => s.budget);
  const goals = useApp((s) => s.savingsGoals);
  const addBudget = useApp((s) => s.addBudget);
  const removeBudget = useApp((s) => s.removeBudget);
  const setGoals = useApp((s) => s.setSavingsGoals);
  const [range, setRange] = useState<"month" | "all">("month");
  const [kind, setKind] = useState<BudgetEntry["kind"]>("earn");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [goalId, setGoalId] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const money = (n: number) => n.toLocaleString(dateLocale, { style: "currency", currency: "USD" });
  const month = todayISO().slice(0, 7);
  const shown = range === "month" ? entries.filter((e) => e.date.startsWith(month)) : entries;
  const sum = (k: BudgetEntry["kind"], list = shown) => list.filter((e) => e.kind === k).reduce((n, e) => n + e.amount, 0);
  const earned = sum("earn");
  const spent = sum("spend");
  const saved = sum("save");
  const left = earned - spent - saved;

  function add(e: FormEvent) {
    e.preventDefault();
    const a = Math.round(Number(amount) * 100) / 100;
    if (!(a > 0) || a > 100000) return;
    addBudget({ kind, amount: a, note: note.trim() || undefined, date, goalId: kind === "save" && goalId ? goalId : undefined });
    setAmount("");
    setNote("");
  }

  return (
    <div>
      <BackLink href="/plan" label={t("plan.title")} />
      <PageHeader title={t("life.budgetTitle")} subtitle={t("life.budgetSub")} />
      <div className="mb-3">
        <Segmented<"month" | "all">
          label={t("life.budgetTitle")}
          value={range}
          onChange={setRange}
          options={[
            { value: "month", label: t("life.budgetMonth") },
            { value: "all", label: t("life.budgetAll") },
          ]}
        />
      </div>
      <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["earned", earned, "text-success"],
            ["spent", spent, "text-danger"],
            ["savedMoney", saved, "text-primary"],
            ["available", left, left < 0 ? "text-danger" : ""],
          ] as const
        ).map(([k, v, c]) => (
          <li key={k} className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
            <p className="text-sm font-bold text-muted">{t(`life.${k}`)}</p>
            <p className={cn("text-xl font-bold", c)}>{money(v)}</p>
          </li>
        ))}
      </ul>
      <Alert className="mb-4">{t("life.budgetTip")}</Alert>

      <Card>
        <form onSubmit={add} className="space-y-3">
          <h2 className="font-bold">{t("life.addEntry")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("life.entryKind")}>
              {(id) => (
                <Select id={id} value={kind} onChange={(e) => setKind(e.target.value as BudgetEntry["kind"])}>
                  <option value="earn">{t("life.kindEarn")}</option>
                  <option value="spend">{t("life.kindSpend")}</option>
                  <option value="save">{t("life.kindSave")}</option>
                </Select>
              )}
            </Field>
            <Field label={t("life.amount")}>{(id) => <Input id={id} type="number" inputMode="decimal" min={0.01} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} required />}</Field>
            <Field label={t("tracker.date")}>{(id) => <Input id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />}</Field>
            {kind === "save" && goals.length > 0 && (
              <Field label={t("life.goal")}>
                {(id) => (
                  <Select id={id} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                    <option value="">{t("life.noGoal")}</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
          </div>
          <Field label={t("life.entryNote")}>{(id) => <Input id={id} value={note} maxLength={80} placeholder={t("life.entryNotePlaceholder")} onChange={(e) => setNote(e.target.value)} />}</Field>
          <Button type="submit" icon={<Plus aria-hidden="true" className="size-4" />} disabled={!(Number(amount) > 0)}>
            {t("common.add")}
          </Button>
        </form>
      </Card>

      <SectionTitle>
        <span className="flex items-center gap-2">
          <PiggyBank aria-hidden="true" className="size-5" />
          {t("life.goals")}
        </span>
      </SectionTitle>
      <ul className="space-y-2">
        {goals.map((g) => {
          const s = entries.filter((e) => e.kind === "save" && e.goalId === g.id).reduce((n, e) => n + e.amount, 0);
          return (
            <li key={g.id} className="rounded-2xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{g.name}</p>
                <button type="button" aria-label={`${t("common.remove")}: ${g.name}`} onClick={() => setGoals(goals.filter((x) => x.id !== g.id))} className="inline-flex size-9 items-center justify-center rounded-full text-danger hover:bg-danger-soft">
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
              <ProgressBar value={s / g.target} label={g.name} tone={s >= g.target ? "success" : "primary"} className="mt-1" />
              <p className="mt-1 text-sm text-muted">{t("life.goalProgress", { saved: s.toFixed(2), target: g.target.toFixed(2) })}</p>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const target = Number(goalTarget);
          if (!goalName.trim() || !(target > 0)) return;
          setGoals([...goals, { id: uid(8), name: goalName.trim().slice(0, 60), target }]);
          setGoalName("");
          setGoalTarget("");
        }}
      >
        <Field label={t("life.goalName")} className="min-w-40 flex-1">
          {(id) => <Input id={id} value={goalName} maxLength={60} onChange={(e) => setGoalName(e.target.value)} />}
        </Field>
        <Field label={t("life.goalTarget")} className="w-36">
          {(id) => <Input id={id} type="number" min={1} value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />}
        </Field>
        <Button type="submit" variant="soft">
          {t("life.addGoal")}
        </Button>
      </form>

      <SectionTitle>{t("life.history")}</SectionTitle>
      {shown.length === 0 ? (
        <EmptyState icon="💵" title={t("life.noEntries")} />
      ) : (
        <ul className="space-y-2">
          {[...shown].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <span className={cn("w-24 shrink-0 font-bold", e.kind === "earn" ? "text-success" : e.kind === "spend" ? "text-danger" : "text-primary")}>
                {e.kind === "spend" ? "−" : "+"}
                {money(e.amount)}
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block truncate">{e.note ?? t(e.kind === "earn" ? "life.kindEarn" : e.kind === "spend" ? "life.kindSpend" : "life.kindSave")}</span>
                <span className="text-muted">{formatDate(e.date, dateLocale)}</span>
              </span>
              <button type="button" aria-label={t("life.removeEntry")} onClick={() => removeBudget(e.id)} className="inline-flex size-9 items-center justify-center rounded-full text-danger hover:bg-danger-soft">
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">{t("life.budgetPrivacy")}</p>
    </div>
  );
}
