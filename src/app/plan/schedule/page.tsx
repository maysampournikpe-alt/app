"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Trash2, HeartPulse, AlertTriangle } from "lucide-react";
import type { ScheduleBlock, ScheduleKind } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { SCHEDULE_KINDS, blockHours, burnoutCheck, overlaps, toMinutes } from "@/lib/balance";
import { cn, uid } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert, Segmented } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/explore/common";
import { BalanceBars } from "@/components/plan/BalanceBars";

const KIND_STYLE: Record<ScheduleKind, string> = {
  school: "border-l-primary",
  study: "border-l-primary",
  practice: "border-l-accent",
  other: "border-l-accent",
  work: "border-l-warning",
  rest: "border-l-success",
  social: "border-l-success",
  family: "border-l-success",
};

function fmt(hhmm: string, locale: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2026, 0, 5, h, m).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** 5.1 Weekly schedule builder. Saved only on this device. */
export default function SchedulePage() {
  const { t, dateLocale } = useT();
  const blocks = useApp((s) => s.schedule);
  const setSchedule = useApp((s) => s.setSchedule);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [day, setDay] = useState(String(todayIdx));
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<ScheduleKind>("practice");
  const [days, setDays] = useState<number[]>([todayIdx]);
  const [start, setStart] = useState("16:00");
  const [end, setEnd] = useState("17:30");
  const [added, setAdded] = useState(false);

  const conflicts = useMemo(() => overlaps(blocks), [blocks]);
  const check = burnoutCheck(blocks);
  const dayBlocks = blocks.filter((b) => b.day === Number(day)).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  function add(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !days.length || start === end) return;
    setSchedule([...blocks, ...days.map((d) => ({ id: uid(8), day: d, start, end, label: label.trim().slice(0, 60), kind }))]);
    setLabel("");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function starter() {
    const school: ScheduleBlock[] = [0, 1, 2, 3, 4].map((d) => ({ id: uid(8), day: d, start: "08:00", end: "15:30", label: t("life.kind_school"), kind: "school" }));
    setSchedule([...blocks, ...school]);
  }

  return (
    <div>
      <BackLink href="/plan" label={t("plan.title")} />
      <PageHeader title={t("life.scheduleTitle")} subtitle={t("life.scheduleSub")} />

      {check.level === "overloaded" && (
        <Link href="/plan/wellbeing" className="mb-4 flex items-center gap-2 rounded-2xl border border-warning/40 bg-warning-soft p-3 font-bold text-warning">
          <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
          {t("wellbeing.warnLink")}
        </Link>
      )}

      {blocks.length === 0 && (
        <Card className="mb-4">
          <Button variant="soft" onClick={starter}>
            {t("life.starterWeek")}
          </Button>
          <p className="mt-2 text-sm text-muted">{t("life.starterHelp")}</p>
        </Card>
      )}

      <div className="mb-3">
        <Segmented<string> label={t("life.pickDay")} value={day} onChange={setDay} options={[0, 1, 2, 3, 4, 5, 6].map((d) => ({ value: String(d), label: t(`life.day${d}`) }))} />
      </div>
      <h2 className="mb-2 text-lg font-bold capitalize">{t(`life.dayLong${day}`)}</h2>
      {dayBlocks.length === 0 ? (
        <p className="mb-4 text-sm text-muted">{t("life.noBlocks")}</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {dayBlocks.map((b) => (
            <li key={b.id} className={cn("flex items-center gap-3 rounded-xl border border-l-8 border-border bg-surface p-3", KIND_STYLE[b.kind])}>
              <div className="w-24 shrink-0 text-sm font-bold">
                {fmt(b.start, dateLocale)}
                <span className="block font-normal text-muted">{fmt(b.end, dateLocale)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{b.label}</p>
                <p className="text-sm text-muted">
                  {t(`life.kind_${b.kind}`)} · {t("life.hoursN", { n: Math.round(blockHours(b) * 10) / 10 })}
                </p>
              </div>
              <button type="button" aria-label={t("life.removeBlock", { label: b.label })} onClick={() => setSchedule(blocks.filter((x) => x.id !== b.id))} className="inline-flex size-10 items-center justify-center rounded-full text-danger hover:bg-danger-soft">
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {conflicts.length > 0 && (
        <div className="mb-4 space-y-2">
          {conflicts.map(([a, b]) => (
            <Alert key={`${a.id}-${b.id}`} tone="warning">
              {t("life.overlap", { a: a.label, b: b.label, day: t(`life.dayLong${a.day}`) })}
            </Alert>
          ))}
        </div>
      )}

      <Card>
        <form onSubmit={add} className="space-y-3">
          <h2 className="font-bold">{t("life.addBlock")}</h2>
          <Field label={t("life.blockLabel")}>{(id) => <Input id={id} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder={t("life.blockLabelPlaceholder")} required />}</Field>
          <Field label={t("life.blockKind")}>
            {(id) => (
              <Select id={id} value={kind} onChange={(e) => setKind(e.target.value as ScheduleKind)}>
                {SCHEDULE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`life.kind_${k}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <fieldset>
            <legend className="mb-2 font-bold">{t("life.blockDays")}</legend>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <Chip key={d} size="sm" selected={days.includes(d)} onClick={() => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))}>
                  {t(`life.day${d}`)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("life.blockStart")}>{(id) => <Input id={id} type="time" value={start} onChange={(e) => setStart(e.target.value)} required />}</Field>
            <Field label={t("life.blockEnd")}>{(id) => <Input id={id} type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />}</Field>
          </div>
          {added && (
            <Alert tone="success" role="status">
              {t("life.blockAdded")}
            </Alert>
          )}
          <Button type="submit" icon={<Plus aria-hidden="true" className="size-4" />} disabled={!label.trim() || !days.length}>
            {t("life.addBlock")}
          </Button>
        </form>
      </Card>

      {blocks.length > 0 && (
        <>
          <SectionTitle>{t("life.weekTotals")}</SectionTitle>
          <Card>
            <BalanceBars blocks={blocks} />
            <Link href="/plan/wellbeing" className="mt-3 inline-flex min-h-10 items-center gap-1.5 font-bold text-primary underline underline-offset-4">
              <HeartPulse aria-hidden="true" className="size-4" />
              {t("life.balanceLink")}
            </Link>
          </Card>
          <Button
            variant="ghost"
            className="mt-4 text-danger"
            onClick={() => {
              if (window.confirm(t("life.clearConfirm"))) setSchedule([]);
            }}
          >
            {t("life.clearWeek")}
          </Button>
        </>
      )}
    </div>
  );
}
