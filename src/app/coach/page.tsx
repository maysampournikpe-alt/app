"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { History, Plus, Trash2, Dumbbell } from "lucide-react";
import type { CoachMode } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { sendToCoach } from "@/lib/coach-client";
import { formatRelative } from "@/lib/time";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { LinkCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatView } from "@/components/coach/ChatView";
import { COACH_MODES } from "@/components/coach/modes";



function CoachKeyed() {
  // Re-start the page when the link changes (e.g. "Practice an interview for this").
  const params = useSearchParams();
  return <CoachInner key={params.toString()} />;
}

function CoachInner() {
  const { t, locale } = useT();
  const params = useSearchParams();
  const chats = useApp((s) => s.chats);
  const saved = useApp((s) => s.saved);
  const startChat = useApp((s) => s.startChat);
  const deleteChat = useApp((s) => s.deleteChat);
  const locked = useApp((s) => s.consent.under13 && !s.parental.coachEnabled);
  const initialMode = params.get("mode") as CoachMode | null;
  const [mode, setMode] = useState<CoachMode>(initialMode && COACH_MODES.some((m) => m.id === initialMode) ? initialMode : "ask");
  const [chatId, setChatId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [demo, setDemo] = useState(false);

  // Interview practice for a saved opportunity: /coach?mode=interview&opp=ID
  const oppId = params.get("opp") ?? undefined;
  const opp = oppId ? saved.find((s) => s.id === oppId)?.opp : undefined;
  const chat = chats.find((c) => c.id === chatId);

  if (locked) {
    return (
      <div>
        <PageHeader title={t("coach.title")} />
        <Alert tone="info" title={t("coach.locked")} />
      </div>
    );
  }

  async function send(text: string) {
    let id = chatId;
    if (!id || !chats.some((c) => c.id === id)) {
      const title = opp && mode === "interview" ? t("coach.interviewFor", { title: opp.title }) : text.slice(0, 60);
      id = startChat(mode, title, opp?.id);
      setChatId(id);
    }
    setBusy(true);
    const r = await sendToCoach(id, mode, text, mode === "interview" || mode === "email" ? opp : undefined);
    setBusy(false);
    setDemo(!!r.demo);
    setNotice(r.notice);
  }

  const starters = [1, 2, 3].map((n) => t(`coach.starter_${mode}_${n}`));
  const intro = opp && (mode === "interview" || mode === "email") ? `${t(`coach.intro_${mode}`)} (${opp.title})` : t(`coach.intro_${mode}`);

  return (
    <div>
      <PageHeader
        title={t("coach.title")}
        subtitle={t("coach.subtitle")}
        action={
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)} icon={<History aria-hidden="true" className="size-4" />}>
              <span className="sr-only sm:not-sr-only">{t("coach.pastChats")}</span>
            </Button>
            <Button variant="soft" size="sm" className="whitespace-nowrap" onClick={() => setChatId(undefined)} icon={<Plus aria-hidden="true" className="size-4" />}>
              {t("coach.newChat")}
            </Button>
          </div>
        }
      />

      <div role="group" aria-label={t("coach.modes")} className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {COACH_MODES.map((m) => (
          <Chip
            key={m.id}
            size="sm"
            selected={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setChatId(undefined);
            }}
            icon={<span aria-hidden="true">{m.emoji}</span>}
          >
            {t(`coach.mode_${m.id}`)}
          </Chip>
        ))}
      </div>

      {notice === "limit" && <Alert tone="warning" className="mb-3">{t("coach.limitNote")}</Alert>}
      {demo && notice !== "limit" && <Alert tone="info" className="mb-3">{t("coach.demoNote")}</Alert>}

      <ChatView key={`${mode}-${chatId ?? "new"}`} chat={chat} busy={busy} onSend={send} starters={starters} intro={intro} />

      <p className="mt-3 text-center text-xs text-muted">{t("coach.safetyNote")}</p>

      <div className="mt-6">
        <LinkCard href="/coach/practice" icon={<Dumbbell className="size-5" />} title={t("coach.practiceTitle")} subtitle={t("coach.practiceSub")} />
      </div>

      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} title={t("coach.pastChats")} closeLabel={t("common.close")}>
        {chats.length === 0 ? (
          <p className="text-muted">{t("coach.noPastChats")}</p>
        ) : (
          <ul className="space-y-2">
            {chats.map((c) => (
              <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border p-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 rounded-lg p-1 text-left hover:bg-surface-2"
                  onClick={() => {
                    setMode(c.mode);
                    setChatId(c.id);
                    setHistoryOpen(false);
                  }}
                >
                  <span className="block truncate font-bold">
                    {COACH_MODES.find((m) => m.id === c.mode)?.emoji} {c.title}
                  </span>
                  <span className="text-xs text-muted">
                    {t(`coach.mode_${c.mode}`)} · {formatRelative(c.updatedAt, locale)}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`${t("coach.deleteChat")}: ${c.title}`}
                  onClick={() => {
                    deleteChat(c.id);
                    if (chatId === c.id) setChatId(undefined);
                  }}
                  className="inline-flex size-10 items-center justify-center rounded-full text-danger hover:bg-danger-soft"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </div>
  );
}

/** 1.2 AI Coach tab. */
export default function CoachPage() {
  return (
    <Suspense>
      <CoachKeyed />
    </Suspense>
  );
}
