"use client";

import { useState, type FormEvent } from "react";
import { Layers, Shuffle, Trash2, RotateCcw, Plus } from "lucide-react";
import type { FlashcardDeck } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { runTask } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert, EmptyState, ProgressBar } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/explore/common";
import { CrisisHelp } from "@/components/safety/CrisisHelp";

/** 4.3 Flashcard maker: notes → flashcards (AI), then study with flip cards. Works offline once made. */
export default function FlashcardsPage() {
  const { t } = useT();
  const decks = useApp((s) => s.decks);
  const addDeck = useApp((s) => s.addDeck);
  const removeDeck = useApp((s) => s.removeDeck);
  const awardXp = useApp((s) => s.awardXp);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<"demo" | "none" | "error" | "crisis" | null>(null);
  const [studying, setStudying] = useState<string | null>(null);

  async function make(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await runTask<{ cards: { front: string; back: string }[] }>("flashcards", { notes });
      if (res.crisis) return setMsg("crisis");
      const cards = res.output?.cards ?? [];
      if (!cards.length) return setMsg("none");
      const id = addDeck({ title: title.trim() || notes.trim().split("\n")[0].slice(0, 40), cards });
      awardXp("flashcards");
      setNotes("");
      setTitle("");
      if (res.demo) setMsg("demo");
      setStudying(id);
    } catch {
      setMsg("error");
    } finally {
      setBusy(false);
    }
  }

  const deck = decks.find((d) => d.id === studying);

  return (
    <div>
      <BackLink href="/coach/practice" label={t("skills.practiceTitle")} />
      <PageHeader title={t("skills.flashcards")} subtitle={t("skills.flashcardsSub")} />
      {deck ? (
        <Study deck={deck} onExit={() => setStudying(null)} />
      ) : (
        <>
          <Card>
            <form onSubmit={make} className="space-y-3">
              <h2 className="font-bold">{t("skills.flashNew")}</h2>
              <Field label={t("skills.flashTitle")}>{(id) => <Input id={id} value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />}</Field>
              <Field label={t("skills.flashNotes")} help={t("skills.flashNotesHelp")}>
                {(id, d) => <Textarea id={id} aria-describedby={d} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={8000} className="min-h-40" required minLength={10} />}
              </Field>
              {msg === "none" && <Alert tone="warning">{t("skills.flashNone")}</Alert>}
              {msg === "error" && <Alert tone="danger">{t("common.error")}</Alert>}
              {msg === "crisis" && <CrisisHelp />}
              <Button type="submit" disabled={busy || notes.trim().length < 10} icon={<Layers aria-hidden="true" className="size-4" />}>
                {busy ? t("skills.flashMaking") : t("skills.flashMake")}
              </Button>
            </form>
          </Card>
          {msg === "demo" && <Alert className="mt-3">{t("skills.flashDemo")}</Alert>}
          <SectionTitle>{t("skills.flashDecks")}</SectionTitle>
          {decks.length === 0 ? (
            <EmptyState icon="🃏" title={t("skills.flashNoDecks")} />
          ) : (
            <ul className="space-y-2">
              {decks.map((d) => (
                <li key={d.id} className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{d.title}</p>
                    <p className="text-sm text-muted">{t("skills.flashCards", { count: d.cards.length })}</p>
                  </div>
                  <Button size="sm" onClick={() => setStudying(d.id)}>
                    {t("skills.flashStudy")}
                    <span className="sr-only">: {d.title}</span>
                  </Button>
                  <button type="button" aria-label={`${t("skills.flashDelete")}: ${d.title}`} onClick={() => removeDeck(d.id)} className="inline-flex size-10 items-center justify-center rounded-full text-danger hover:bg-danger-soft">
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Study({ deck, onExit }: { deck: FlashcardDeck; onExit: () => void }) {
  const { t } = useT();
  const updateDeck = useApp((s) => s.updateDeck);
  const [order, setOrder] = useState(() => deck.cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const done = pos >= order.length;
  const card = deck.cards[order[pos]];

  function answer(k: boolean) {
    if (k) setKnown((n) => n + 1);
    setFlipped(false);
    setPos((p) => p + 1);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{deck.title}</h2>
        <Button variant="ghost" size="sm" onClick={onExit}>
          {t("common.back")}
        </Button>
      </div>
      <ProgressBar value={Math.min(pos, order.length) / order.length} label={t("skills.flashProgress", { a: Math.min(pos + 1, order.length), b: order.length })} className="mb-3" />
      {done ? (
        <Card className="text-center">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <p className="mt-2 text-lg font-bold" role="status">
            {t("skills.flashDone", { known, total: order.length })}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              icon={<RotateCcw aria-hidden="true" className="size-4" />}
              onClick={() => {
                setPos(0);
                setKnown(0);
              }}
            >
              {t("skills.flashRestart")}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <p className="mb-2 text-sm text-muted">{t("skills.flashProgress", { a: pos + 1, b: order.length })}</p>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={`${t("skills.flashFlip")}. ${flipped ? t("skills.flashBack") : t("skills.flashFront")}: ${flipped ? card.back : card.front}`}
            className={cn("flex min-h-56 w-full flex-col items-center justify-center rounded-3xl border-2 p-6 text-center shadow-md", flipped ? "border-primary bg-primary-soft text-on-primary-soft" : "border-border bg-surface")}
          >
            <span className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">{flipped ? t("skills.flashBack") : t("skills.flashFront")}</span>
            <span className="text-xl font-bold" aria-live="polite">
              {flipped ? card.back : card.front}
            </span>
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => answer(false)}>
              {t("skills.flashAgain")}
            </Button>
            <Button onClick={() => answer(true)}>{t("skills.flashKnow")}</Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            icon={<Shuffle aria-hidden="true" className="size-4" />}
            onClick={() => {
              setOrder((o) => [...o].sort(() => Math.random() - 0.5));
              setPos(0);
              setFlipped(false);
            }}
          >
            {t("skills.flashShuffle")}
          </Button>
        </>
      )}
      <Card className="mt-4">
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!front.trim() || !back.trim()) return;
            updateDeck(deck.id, { cards: [...deck.cards, { front: front.trim(), back: back.trim() }] });
            setOrder((o) => [...o, deck.cards.length]);
            setFront("");
            setBack("");
          }}
        >
          <h3 className="font-bold">{t("skills.flashAddCard")}</h3>
          <Field label={t("skills.flashFront")}>{(id) => <Input id={id} value={front} maxLength={200} onChange={(e) => setFront(e.target.value)} />}</Field>
          <Field label={t("skills.flashBack")}>{(id) => <Input id={id} value={back} maxLength={300} onChange={(e) => setBack(e.target.value)} />}</Field>
          <Button type="submit" size="sm" variant="soft" icon={<Plus aria-hidden="true" className="size-4" />}>
            {t("common.add")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
