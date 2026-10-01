"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Flame, Lightbulb, MessageCircle } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { CHESS_PUZZLES, MATH_PROBLEMS, VOCAB, DEBATE_PROMPTS } from "@/data/daily";
import { todayISO, cn } from "@/lib/utils";
import { PageHeader, Alert, Segmented } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { BackLink } from "@/components/explore/common";
import { ChessPuzzleBoard } from "@/components/skills/ChessPuzzleBoard";

type Kind = "chess" | "math" | "vocab" | "debate";
const KINDS: Kind[] = ["chess", "math", "vocab", "debate"];

/** Day number since 2026-01-01 (same for everyone on the same day). */
function dayNumber(iso: string) {
  return Math.floor((Date.parse(`${iso}T12:00:00Z`) - Date.parse("2026-01-01T12:00:00Z")) / 86_400_000);
}

/** 4.2 Daily challenge: chess puzzle, math problem, vocabulary word, or debate prompt. */
export default function DailyPage() {
  const { t, L } = useT();
  const today = todayISO();
  const day = dayNumber(today);
  const featured = KINDS[((day % 4) + 4) % 4];
  const [kind, setKind] = useState<Kind>(featured);
  const doneToday = useApp((s) => s.dailyDone.includes(today));
  const streak = useApp((s) => s.streak.count);
  const completeDaily = useApp((s) => s.completeDaily);
  const idx = (n: number) => ((Math.floor(day / 4) % n) + n) % n;

  return (
    <div>
      <BackLink href="/coach/practice" label={t("skills.practiceTitle")} />
      <PageHeader title={t("skills.daily")} subtitle={t("skills.dailySub")} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="accent" icon={<Flame aria-hidden="true" className="size-3.5" />}>
          {t("me.streak", { count: streak })}
        </Badge>
        {doneToday && <Badge tone="success">✓ {t("skills.doneToday")}</Badge>}
      </div>
      <div className="mb-4">
        <Segmented<Kind>
          label={t("skills.daily")}
          value={kind}
          onChange={setKind}
          options={KINDS.map((k) => ({ value: k, label: `${k === featured ? "⭐ " : ""}${t(`skills.type_${k}`)}` }))}
        />
      </div>
      <Card>
        {kind === "chess" && <ChessChallenge key={`c${day}`} puzzle={CHESS_PUZZLES[idx(CHESS_PUZZLES.length)]} onDone={completeDaily} />}
        {kind === "math" && <MathChallenge key={`m${day}`} problem={MATH_PROBLEMS[idx(MATH_PROBLEMS.length)]} onDone={completeDaily} />}
        {kind === "vocab" && <VocabChallenge key={`v${day}`} wordIndex={idx(VOCAB.length)} onDone={completeDaily} />}
        {kind === "debate" && <DebateChallenge key={`d${day}`} prompt={L(DEBATE_PROMPTS[idx(DEBATE_PROMPTS.length)])} onDone={completeDaily} />}
      </Card>
    </div>
  );
}

function ChessChallenge({ puzzle, onDone }: { puzzle: (typeof CHESS_PUZZLES)[number]; onDone: () => void }) {
  const { t, L } = useT();
  const [hint, setHint] = useState(false);
  const [answer, setAnswer] = useState(false);
  return (
    <div>
      <ChessPuzzleBoard fen={puzzle.fen} onSolved={onDone} />
      <div className="mx-auto mt-3 flex max-w-sm flex-wrap gap-2">
        <Button variant="ghost" size="sm" icon={<Lightbulb aria-hidden="true" className="size-4" />} onClick={() => setHint(true)}>
          {t("skills.hint")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setAnswer(true)}>
          {t("skills.showAnswer")}
        </Button>
      </div>
      {hint && <p className="mx-auto mt-2 max-w-sm text-sm">💡 {L(puzzle.hint)}</p>}
      {answer && <p className="mx-auto mt-2 max-w-sm font-bold">{t("skills.answerIs", { answer: puzzle.solution })}</p>}
    </div>
  );
}

function MathChallenge({ problem, onDone }: { problem: (typeof MATH_PROBLEMS)[number]; onDone: () => void }) {
  const { t, L } = useT();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [shown, setShown] = useState(false);
  function check(e: FormEvent) {
    e.preventDefault();
    const n = parseFloat(value.replace(/[$,%\s]|x\s*=|°/gi, ""));
    const ok = Math.abs(n - problem.answer) < 0.001;
    setStatus(ok ? "right" : "wrong");
    if (ok) onDone();
  }
  return (
    <form onSubmit={check} className="space-y-3">
      <p className="text-lg font-bold">{L(problem.q)}</p>
      <label htmlFor="math-ans" className="block text-sm font-bold">
        {t("skills.yourAnswer")}
      </label>
      <div className="flex gap-2">
        <Input id="math-ans" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="max-w-40" autoComplete="off" />
        <Button type="submit" disabled={!value.trim()}>
          {t("skills.check")}
        </Button>
      </div>
      <div aria-live="polite">
        {status === "right" && <Alert tone="success" title={t("skills.correct")}>{L(problem.explain)}</Alert>}
        {status === "wrong" && <Alert tone="warning">{t("skills.wrong")}</Alert>}
      </div>
      {status !== "right" && (
        <Button variant="ghost" size="sm" onClick={() => setShown(true)}>
          {t("skills.showAnswer")}
        </Button>
      )}
      {shown && status !== "right" && (
        <p className="text-sm">
          <span className="font-bold">{t("skills.answerIs", { answer: problem.answer })}</span> — {L(problem.explain)}
        </p>
      )}
    </form>
  );
}

function VocabChallenge({ wordIndex, onDone }: { wordIndex: number; onDone: () => void }) {
  const { t, L } = useT();
  const w = VOCAB[wordIndex];
  // Three other definitions as wrong choices (stable for the day).
  const choices = useMemo(() => {
    const others = [1, 7, 13].map((o) => VOCAB[(wordIndex + o) % VOCAB.length]);
    const all = [w, ...others];
    const shift = wordIndex % 4;
    return [...all.slice(shift), ...all.slice(0, shift)];
  }, [w, wordIndex]);
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-3xl font-bold" lang="en">
        {w.word}
      </p>
      <p className="font-bold">{t("skills.vocabQuiz", { word: w.word })}</p>
      <div className="grid gap-2">
        {choices.map((c) => {
          const isRight = c.word === w.word;
          const isPicked = picked === c.word;
          return (
            <button
              key={c.word}
              type="button"
              disabled={!!picked}
              onClick={() => {
                setPicked(c.word);
                if (isRight) onDone();
              }}
              className={cn(
                "min-h-11 rounded-xl border-2 p-3 text-left",
                picked && isRight ? "border-success bg-success-soft" : isPicked ? "border-danger bg-danger-soft" : "border-border hover:border-primary",
              )}
            >
              {L(c.def)}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {picked && (
          <Alert tone={picked === w.word ? "success" : "warning"} title={picked === w.word ? t("skills.correct") : t("skills.answerIs", { answer: L(w.def) })}>
            <p>{t("skills.inSpanish", { es: w.es })}</p>
            <p className="mt-1">
              <span className="font-bold">{t("skills.example")}:</span> <span lang="en">{w.example}</span>
            </p>
          </Alert>
        )}
      </div>
    </div>
  );
}

function DebateChallenge({ prompt, onDone }: { prompt: string; onDone: () => void }) {
  const { t } = useT();
  const [side, setSide] = useState<"agree" | "disagree" | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (words >= 30 && side) {
          setSent(true);
          onDone();
        }
      }}
    >
      <p className="text-lg font-bold">“{prompt}”</p>
      <p className="text-sm text-muted">{t("skills.debateTask")}</p>
      <div className="flex gap-2">
        <Button variant={side === "agree" ? "primary" : "secondary"} aria-pressed={side === "agree"} onClick={() => setSide("agree")}>
          {t("skills.agree")}
        </Button>
        <Button variant={side === "disagree" ? "primary" : "secondary"} aria-pressed={side === "disagree"} onClick={() => setSide("disagree")}>
          {t("skills.disagree")}
        </Button>
      </div>
      <label htmlFor="arg" className="block font-bold">
        {t("skills.yourArgument")}
      </label>
      <Textarea id="arg" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
      <p className={cn("text-sm", words >= 30 ? "text-success" : "text-muted")}>{t("skills.wordCount", { n: words })}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={words < 30 || !side || sent}>
          {t("skills.submitArgument")}
        </Button>
        <Link href={`/coach?mode=debate&prompt=${encodeURIComponent(prompt)}`} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary underline underline-offset-4">
          <MessageCircle aria-hidden="true" className="size-4" />
          {t("skills.debateCoach")}
        </Link>
      </div>
      {sent && (
        <Alert tone="success" role="status">
          {t("skills.argumentSaved")}
        </Alert>
      )}
    </form>
  );
}
