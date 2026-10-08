"use client";

import { useState } from "react";
import { Search, Target, RotateCcw } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { CAREERS, QUIZ_QUESTIONS, RIASEC_INFO, careerProfileUrl, type Riasec } from "@/data/careers";
import { PageHeader, ProgressBar, SectionTitle, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink, ExternalA, useRunSearch } from "@/components/explore/common";
import { cn } from "@/lib/utils";

const SCORES = [2, 1, 0] as const;

/** 3.2.2 "What should I do?" interest quiz (based on Holland's six interest types). */
export default function QuizPage() {
  const { t, L } = useT();
  const goals = useApp((s) => s.profile.goals);
  const setProfile = useApp((s) => s.setProfile);
  const [answers, setAnswers] = useState<(number | undefined)[]>(Array(QUIZ_QUESTIONS.length).fill(undefined));
  const [done, setDone] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const runSearch = useRunSearch();
  const answered = answers.filter((a) => a !== undefined).length;

  const totals = (Object.keys(RIASEC_INFO) as Riasec[]).map((code) => ({
    code,
    score: QUIZ_QUESTIONS.reduce((n, q, i) => n + (q.code === code ? (answers[i] ?? 0) : 0), 0),
  }));
  const top = [...totals].sort((a, b) => b.score - a.score).slice(0, 2);
  const matches = CAREERS.map((c) => ({ c, score: c.codes.reduce((n, code, idx) => n + (top.some((tp) => tp.code === code) ? (idx === 0 ? 3 : 1) : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <div>
      <BackLink />
      <PageHeader title={t("explore.quiz")} subtitle={done ? undefined : t("explore.quizIntro")} />
      {!done ? (
        <>
          <ProgressBar value={answered / QUIZ_QUESTIONS.length} label={t("explore.quizProgress", { a: answered, b: QUIZ_QUESTIONS.length })} className="mb-1" />
          <p className="mb-4 text-sm text-muted">{t("explore.quizProgress", { a: answered, b: QUIZ_QUESTIONS.length })}</p>
          <ol className="space-y-3">
            {QUIZ_QUESTIONS.map((q, i) => (
              <li key={i}>
                <fieldset className="rounded-xl border border-border bg-surface p-4">
                  <legend className="sr-only">{L(q.q)}</legend>
                  <p aria-hidden="true" className="mb-2 font-bold">
                    {i + 1}. {L(q.q)}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {SCORES.map((v) => (
                      <label key={v} className={cn("flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-bold", answers[i] === v ? "border-primary bg-primary text-on-primary" : "border-border hover:border-primary")}>
                        <input
                          type="radio"
                          name={`q${i}`}
                          className="sr-only"
                          checked={answers[i] === v}
                          onChange={() => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))}
                        />
                        {v === 2 ? t("explore.quizLove") : v === 1 ? t("explore.quizOk") : t("explore.quizNo")}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <Button size="lg" full className="mt-4" disabled={answered < QUIZ_QUESTIONS.length} onClick={() => setDone(true)}>
            {t("explore.seeResults")}
          </Button>
        </>
      ) : (
        <div>
          <SectionTitle>{t("explore.quizResult")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {top.map(({ code }) => (
              <Card key={code}>
                <p className="text-3xl" aria-hidden="true">
                  {RIASEC_INFO[code].emoji}
                </p>
                <p className="text-lg font-bold">{L(RIASEC_INFO[code].name)}</p>
                <p className="text-sm">{L(RIASEC_INFO[code].desc)}</p>
              </Card>
            ))}
          </div>
          <SectionTitle>{t("explore.quizCareers")}</SectionTitle>
          {added && (
            <Alert tone="success" role="status" className="mb-3">
              {t("explore.goalAdded")}
            </Alert>
          )}
          <ul className="space-y-3">
            {matches.map(({ c }) => (
              <li key={c.id}>
                <Card>
                  <p className="text-lg font-bold">
                    <span aria-hidden="true">{c.emoji}</span> {L(c.title)}
                  </p>
                  <p className="text-sm">{L(c.day)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="soft" icon={<Search aria-hidden="true" className="size-4" />} onClick={() => runSearch(L(c.search))}>
                      {t("explore.findOpps")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Target aria-hidden="true" className="size-4" />}
                      onClick={() => {
                        const g = L(c.title);
                        if (!goals.includes(g)) setProfile({ goals: [...goals, g].slice(0, 5) });
                        setAdded(c.id);
                      }}
                    >
                      {t("explore.addGoal")}
                    </Button>
                    <ExternalA href={careerProfileUrl(c)}>{t("explore.watchVideo")}</ExternalA>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            className="mt-4"
            icon={<RotateCcw aria-hidden="true" className="size-4" />}
            onClick={() => {
              setAnswers(Array(QUIZ_QUESTIONS.length).fill(undefined));
              setDone(false);
            }}
          >
            {t("explore.quizRetake")}
          </Button>
        </div>
      )}
    </div>
  );
}
