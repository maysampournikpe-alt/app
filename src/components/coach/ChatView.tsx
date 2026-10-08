"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import type { Chat } from "@/types";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { VoiceInputButton } from "@/components/a11y/VoiceInputButton";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";
import { CrisisHelp } from "@/components/safety/CrisisHelp";
import { Markdown } from "./Markdown";

/** The chat messages and the message box. */
export function ChatView({
  chat,
  busy,
  onSend,
  starters,
  intro,
  initialText,
}: {
  chat?: Chat;
  busy: boolean;
  onSend: (text: string) => void;
  starters: string[];
  intro: string;
  /** Text to pre-fill in the message box (e.g. a debate prompt from the Daily challenge) */
  initialText?: string;
}) {
  const { t } = useT();
  const [text, setText] = useState(initialText ?? "");
  const endRef = useRef<HTMLDivElement>(null);
  const messages = chat?.messages ?? [];
  const lastText = messages[messages.length - 1]?.text;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, lastText]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const v = text.trim();
    if (!v || busy) return;
    setText("");
    onSend(v);
  }

  return (
    <div className="flex flex-col">
      <div role="log" aria-live="polite" aria-busy={busy} aria-label={t("coach.title")} className="space-y-4">
        {/* Coach introduction for this mode */}
        <div className="flex items-start gap-2">
          <Logo className="size-9 shrink-0" />
          <div className="rounded-xl rounded-tl-sm bg-surface p-3">
            <p>{intro}</p>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {starters.map((s) => (
              <button key={s} type="button" onClick={() => onSend(s)} className="rounded-xl border-2 border-primary/40 bg-surface px-3 py-2 text-left text-sm font-bold text-primary hover:border-primary">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-on-primary">
                <span className="sr-only">{t("coach.you")}: </span>
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2">
              <Logo className="size-9 shrink-0" />
              <div className="min-w-0 max-w-[85%] space-y-2">
                <div className={cn("rounded-xl rounded-tl-sm bg-surface p-3.5 shadow-sm", m.crisis && "border-2 border-danger/40")}>
                  <span className="sr-only">{t("coach.coach")}: </span>
                  {m.text ? <Markdown text={m.text} /> : <span className="inline-flex gap-1" aria-label={t("coach.thinking")}><Dot /><Dot d={150} /><Dot d={300} /></span>}
                </div>
                {m.crisis && <CrisisHelp />}
                {m.text && !(busy && i === messages.length - 1) && <ReadAloudButton text={m.text.replace(/[*_`#]/g, "")} compact />}
              </div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mt-4 flex items-end gap-2 rounded-2xl border-2 border-b-4 border-input bg-surface p-1.5 shadow-lg focus-within:border-primary lg:bottom-4">
        <label htmlFor="coach-input" className="sr-only">
          {t("coach.inputLabel")}
        </label>
        <textarea
          id="coach-input"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t("coach.placeholder")}
          maxLength={8000}
          className="max-h-40 min-h-11 w-full resize-none bg-transparent px-2 py-2.5 text-base outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <VoiceInputButton onText={(v) => setText(v)} />
        <button type="submit" disabled={busy || !text.trim()} aria-label={t("coach.send")} className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-50">
          <SendHorizontal aria-hidden="true" className="size-5" />
        </button>
      </form>
    </div>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return <span aria-hidden="true" className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d}ms` }} />;
}
