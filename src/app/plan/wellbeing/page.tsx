"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartHandshake, Wind, Shuffle, CalendarClock } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { burnoutCheck } from "@/lib/balance";
import { daysUntil, cn } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert } from "@/components/ui/misc";
import { Card, LinkCard } from "@/components/ui/Card";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { BackLink } from "@/components/explore/common";
import { BalanceBars } from "@/components/plan/BalanceBars";

const FEELINGS = [
  { id: "great", emoji: "😄" },
  { id: "ok", emoji: "🙂" },
  { id: "stressed", emoji: "😣" },
  { id: "bad", emoji: "😢" },
] as const;

const PHASES = ["breatheIn", "breatheHold", "breatheOut", "breatheHold"] as const;

/** Box breathing: 4 counts each step, for about one minute. */
function Breathing() {
  const { t } = useT();
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (tick >= 64) setRunning(false);
  }, [tick]);
  const phase = PHASES[Math.floor(tick / 4) % 4];
  const count = 4 - (tick % 4);
  const big = phase === "breatheIn" || (phase === "breatheHold" && Math.floor(tick / 4) % 4 === 1);
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Wind aria-hidden="true" className="size-5 text-primary" />
        {t("wellbeing.breathe")}
      </h2>
      <p className="mb-3 text-sm text-muted">{t("wellbeing.breatheHelp")}</p>
      {running && (
        <div className="my-4 flex flex-col items-center gap-3">
          <div aria-hidden="true" className={cn("rounded-full bg-primary-soft transition-all duration-[4000ms] ease-in-out", big ? "size-40" : "size-20")} />
          <p role="status" className="text-xl font-bold">
            {t(`wellbeing.${phase}`)} {count}
          </p>
        </div>
      )}
      <Button
        variant={running ? "secondary" : "primary"}
        onClick={() => {
          setTick(0);
          setRunning((r) => !r);
        }}
      >
        {running ? t("wellbeing.breatheStop") : t("wellbeing.breatheStart")}
      </Button>
    </Card>
  );
}

/** Phase 7: burnout check, stress tips, help contacts, and the balance meter. */
export default function WellbeingPage() {
  const { t } = useT();
  const blocks = useApp((s) => s.schedule);
  const saved = useApp((s) => s.saved);
  const profile = useApp((s) => s.profile);
  const breakMinutes = useApp((s) => s.settings.studyBreakMinutes);
  const setSettings = useApp((s) => s.setSettings);
  const [feel, setFeel] = useState<(typeof FEELINGS)[number]["id"] | null>(null);
  const [tipStart, setTipStart] = useState(() => new Date().getDate() % 10);

  const deadlinesThisWeek = saved.filter((s) => {
    const d = daysUntil(s.opp.deadline);
    return s.status === "saved" && d !== undefined && d >= 0 && d <= 7;
  }).length;
  const check = burnoutCheck(blocks, deadlinesThisWeek);
  const tips = [0, 1, 2].map((i) => ((tipStart + i) % 10) + 1);

  return (
    <div>
      <BackLink href="/plan" label={t("plan.title")} />
      <PageHeader title={t("wellbeing.title")} subtitle={t("wellbeing.subtitle")} />

      <Card className="mb-4">
        <h2 className="mb-3 text-lg font-bold">{t("wellbeing.checkin")}</h2>
        <div role="group" aria-label={t("wellbeing.checkin")} className="grid grid-cols-4 gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={feel === f.id}
              onClick={() => setFeel(f.id)}
              className={cn("flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-bold", feel === f.id ? "border-primary bg-primary-soft text-on-primary-soft" : "border-border hover:border-primary")}
            >
              <span aria-hidden="true" className="text-3xl">
                {f.emoji}
              </span>
              {t(`wellbeing.feel_${f.id}`)}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          {feel && (
            <Alert tone={feel === "bad" ? "danger" : feel === "stressed" ? "warning" : "success"} className="mt-3">
              {t(`wellbeing.reply_${feel}`)}
              {feel === "bad" && (
                <Link href="/help" className="mt-2 block font-bold underline">
                  {t("wellbeing.helpSub")}
                </Link>
              )}
            </Alert>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{t("wellbeing.privacy")}</p>
      </Card>

      <SectionTitle>{t("wellbeing.burnout")}</SectionTitle>
      {blocks.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("wellbeing.balanceEmpty")}</p>
          <ButtonLink href="/plan/schedule" variant="soft" size="sm" className="mt-3" icon={<CalendarClock aria-hidden="true" className="size-4" />}>
            {t("life.scheduleTitle")}
          </ButtonLink>
        </Card>
      ) : (
        <Card className="space-y-3">
          <Alert tone={check.level === "ok" ? "success" : check.level === "busy" ? "info" : "warning"} title={t(`wellbeing.${check.level}`)}>
            {check.reasons.length > 0 && (
              <ul className="mt-1 list-disc pl-5">
                {check.reasons.map((r) => (
                  <li key={r}>{t(`wellbeing.reason_${r}`, { n: check.heavyDays })}</li>
                ))}
              </ul>
            )}
          </Alert>
          <p className="text-sm">
            {t("wellbeing.committed", { n: Math.round(check.committedHours) })} · {t("wellbeing.rest", { n: Math.round(check.restHours) })}
          </p>
          {check.level !== "ok" && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>{t("wellbeing.suggest1")}</li>
              <li>{t("wellbeing.suggest2")}</li>
              <li>{t("wellbeing.suggest3")}</li>
            </ul>
          )}
          <h3 className="pt-2 font-bold">{t("wellbeing.balance")}</h3>
          <p className="text-sm text-muted">{t("wellbeing.balanceHelp")}</p>
          <BalanceBars blocks={blocks} />
        </Card>
      )}

      <SectionTitle>{t("wellbeing.tips")}</SectionTitle>
      <ul className="space-y-2">
        {tips.map((n) => (
          <li key={n} className="rounded-xl border border-border bg-surface p-3">
            💡 {t(`wellbeing.tip${n}`)}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="mt-2" icon={<Shuffle aria-hidden="true" className="size-4" />} onClick={() => setTipStart((x) => (x + 3) % 10)}>
        {t("wellbeing.moreTips")}
      </Button>

      <div className="mt-6 space-y-4">
        <Breathing />
        <Card>
          <h2 className="text-lg font-bold">{t("wellbeing.breaks")}</h2>
          <p className="mb-3 text-sm text-muted">{t("wellbeing.breaksHelp")}</p>
          <Field label={t("settings.studyBreaks")}>
            {(id) => (
              <Select id={id} value={breakMinutes} onChange={(e) => setSettings({ studyBreakMinutes: Number(e.target.value) })}>
                <option value={0}>{t("settings.studyBreaksOff")}</option>
                {[25, 45, 60].map((m) => (
                  <option key={m} value={m}>
                    {t("settings.studyBreaksEvery", { n: m })}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Card>
        <LinkCard
          href="/help"
          icon={<HeartHandshake className="size-5" />}
          title={t("wellbeing.help")}
          subtitle={profile.counselorName ? `${profile.counselorName}${profile.counselorContact ? ` · ${profile.counselorContact}` : ""}` : t("wellbeing.helpSub")}
        />
      </div>
    </div>
  );
}
