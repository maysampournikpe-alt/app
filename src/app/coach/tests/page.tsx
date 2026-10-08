"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Timer } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { QUESTIONS, TESTS, type PracticeQ, type TestId } from "@/data/practice-tests";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert, ProgressBar } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BackLink } from "@/components/explore/common";

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/** Pick a balanced set: about half math, half reading/writing (+ science for the ACT). */
function buildTest(id: TestId, count: number): PracticeQ[] {
  const pool = QUESTIONS.filter((q) => q.tests.includes(id));
  const sci = shuffle(pool.filter((q) => q.section === "science")).slice(0, id === "act" ? 3 : 0);
  const rest = count - sci.length;
  const math = shuffle(pool.filter((q) => q.section === "math")).slice(0, Math.ceil(rest / 2));
  const rw = shuffle(pool.filter((q) => q.section === "rw")).slice(0, rest - math.length);
  return shuffle([...math, ...rw, ...sci]);
}

function useClock(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return { seconds: s, reset: () => setS(0) };
}

/** 4.4 Practice tests: SAT, PSAT, ACT and TSI style questions with explanations. */
export default function PracticeTestsPage() {
  const { t, L, locale } = useT();
  const scores = useApp((s) => s.practiceScores);
  const addScore = useApp((s) => s.addPracticeScore);
  const [test, setTest] = useState<TestId | null>(null);
  const [qs, setQs] = useState<PracticeQ[]>([]);
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const finished = test !== null && pos >= qs.length;
  const clock = useClock(test !== null && !finished);
  const info = TESTS.find((x) => x.id === test);
  const score = useMemo(() => answers.filter((a, i) => a === qs[i]?.answer).length, [answers, qs]);

  function start(id: TestId) {
    const meta = TESTS.find((x) => x.id === id)!;
    setTest(id);
    setQs(buildTest(id, meta.count));
    setPos(0);
    setPicked(null);
    setChecked(false);
    setAnswers([]);
    clock.reset();
  }

  function next() {
    const nextAnswers = [...answers, picked ?? -1];
    setAnswers(nextAnswers);
    setPicked(null);
    setChecked(false);
    setPos((p) => p + 1);
    if (pos + 1 >= qs.length && test) addScore(test.toUpperCase(), nextAnswers.filter((a, i) => a === qs[i].answer).length, qs.length);
  }

  const mmss = `${Math.floor(clock.seconds / 60)}:${String(clock.seconds % 60).padStart(2, "0")}`;
  const q = qs[pos];

  return (
    <div>
      <BackLink href="/coach/practice" label={t("skills.practiceTitle")} />
      <PageHeader title={t("skills.tests")} subtitle={t("skills.testsSub")} />

      {!test && (
        <>
          <h2 className="mb-3 font-bold">{t("skills.testPick")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {TESTS.map((x) => (
              <li key={x.id}>
                <Card className="flex h-full flex-col">
                  <p className="text-2xl font-bold">{x.name}</p>
                  <p className="mb-3 flex-1 text-sm text-muted">{t("skills.testInfo", { n: x.count, m: x.minutes })}</p>
                  <Button onClick={() => start(x.id)}>
                    {t("skills.testStart")}
                    <span className="sr-only">: {x.name}</span>
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
          <Alert className="mt-4">{t("skills.testNote")}</Alert>
          {scores.length > 0 && (
            <>
              <SectionTitle>{t("skills.testHistory")}</SectionTitle>
              <ul className="space-y-2">
                {scores.slice(0, 10).map((s, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                    <span className="font-bold">{s.test}</span>
                    <span>
                      {s.score}/{s.total} <span className="text-sm text-muted">· {formatRelative(s.at, locale)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {test && !finished && q && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-sm">
            <span className="font-bold">
              {info?.name} · {t("skills.testQ", { a: pos + 1, b: qs.length })}
            </span>
            <span className="flex items-center gap-1 text-muted">
              <Timer aria-hidden="true" className="size-4" />
              {t("skills.timer", { t: mmss })}
            </span>
          </div>
          <ProgressBar value={pos / qs.length} label={t("skills.testQ", { a: pos + 1, b: qs.length })} className="mb-4" />
          <Card>
            <Badge tone="primary" className="mb-2">
              {t(`skills.section_${q.section}`)}
            </Badge>
            {q.passage && (
              <blockquote lang="en" className="mb-3 rounded-xl bg-surface-2 p-3 text-sm">
                {q.passage}
              </blockquote>
            )}
            <fieldset>
              <legend className="mb-3 text-lg font-bold" lang={typeof q.q === "string" ? "en" : undefined}>
                {L(q.q)}
              </legend>
              <div className="space-y-2">
                {q.choices.map((c, i) => {
                  const right = checked && i === q.answer;
                  const wrong = checked && picked === i && i !== q.answer;
                  return (
                    <label
                      key={i}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border-2 p-3",
                        right ? "border-success bg-success-soft" : wrong ? "border-danger bg-danger-soft" : picked === i ? "border-primary bg-primary-soft" : "border-border hover:border-primary",
                        checked && "cursor-default",
                      )}
                    >
                      <input type="radio" name={`q-${q.id}`} checked={picked === i} disabled={checked} onChange={() => setPicked(i)} className="size-5 accent-[var(--primary)]" />
                      <span lang={typeof c === "string" ? "en" : undefined}>
                        <span className="mr-1 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {L(c)}
                      </span>
                      {right && <CheckCircle2 aria-hidden="true" className="ml-auto size-5 text-success" />}
                      {wrong && <XCircle aria-hidden="true" className="ml-auto size-5 text-danger" />}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div aria-live="polite" className="mt-3">
              {checked && (
                <Alert tone={picked === q.answer ? "success" : "warning"} title={picked === q.answer ? t("skills.correct") : t("skills.testCorrectAnswer", { answer: `${String.fromCharCode(65 + q.answer)}. ${L(q.choices[q.answer])}` })}>
                  {L(q.explain)}
                </Alert>
              )}
            </div>
            <div className="mt-4">
              {!checked ? (
                <Button full disabled={picked === null} onClick={() => setChecked(true)}>
                  {t("skills.testSubmit")}
                </Button>
              ) : (
                <Button full onClick={next}>
                  {pos + 1 >= qs.length ? t("skills.testFinish") : t("skills.testNext")}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {finished && (
        <div>
          <Card className="text-center">
            <p className="text-5xl" aria-hidden="true">
              {score / qs.length >= 0.8 ? "🏆" : score / qs.length >= 0.5 ? "💪" : "📚"}
            </p>
            <p className="mt-2 text-2xl font-bold" role="status">
              {t("skills.testScore", { score, total: qs.length })}
            </p>
            <p className="text-sm text-muted">{t("skills.timer", { t: mmss })}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => start(test!)}>{t("skills.testAgain")}</Button>
              <Button variant="secondary" onClick={() => setTest(null)}>
                {t("common.back")}
              </Button>
            </div>
          </Card>
          <SectionTitle>{t("skills.testReview")}</SectionTitle>
          <ol className="space-y-2">
            {qs.map((x, i) => (
              <li key={x.id} className={cn("rounded-xl border p-3 text-sm", answers[i] === x.answer ? "border-success/40" : "border-danger/40")}>
                <p className="font-bold">
                  {i + 1}. {L(x.q)}
                </p>
                {answers[i] !== x.answer && <p>{t("skills.testYourAnswer", { answer: answers[i] >= 0 ? L(x.choices[answers[i]]) : "—" })}</p>}
                <p>{t("skills.testCorrectAnswer", { answer: L(x.choices[x.answer]) })}</p>
                <p className="text-muted">{L(x.explain)}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
