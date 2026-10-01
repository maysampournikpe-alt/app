"use client";

import type { CoachMode, Opportunity } from "@/types";
import { useApp, profileSummary } from "./store";

export interface StreamResult {
  crisis?: string;
  demo?: boolean;
  notice?: string;
}

/**
 * Send the chat to /api/coach and stream the reply into the store as it arrives.
 * Used by the Coach tab and other helpers (essay feedback, interview practice).
 */
export async function sendToCoach(chatId: string, mode: CoachMode, text: string, opp?: Opportunity): Promise<StreamResult> {
  const app = useApp.getState();
  const now = () => new Date().toISOString();
  const chat = app.chats.find((c) => c.id === chatId);
  const isFirst = !chat || chat.messages.length === 0;
  app.addChatMessage(chatId, { role: "user", text, at: now() });
  app.addChatMessage(chatId, { role: "assistant", text: "", at: now() });
  if (isFirst) app.awardXp("coach");

  const history = (useApp.getState().chats.find((c) => c.id === chatId)?.messages ?? [])
    .filter((m) => m.text || m.role === "user")
    .filter((m, i, arr) => !(i === arr.length - 1 && m.role === "assistant"))
    .map((m) => ({ role: m.role, text: m.text }));

  try {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-device-id": app.deviceId },
      body: JSON.stringify({
        mode,
        messages: history,
        locale: app.settings.locale,
        profile: profileSummary(app),
        opp: opp ? { title: opp.title, organization: opp.organization, category: opp.category, description: opp.description.slice(0, 600) } : undefined,
      }),
    });
    const crisis = res.headers.get("x-rumbo-crisis") ?? undefined;
    const demo = res.headers.get("x-rumbo-demo") === "1";
    const notice = res.headers.get("x-rumbo-notice") ?? undefined;
    if (!res.ok || !res.body) throw new Error("bad response");
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let acc = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += dec.decode(value, { stream: true });
      useApp.getState().updateLastAssistant(chatId, acc);
    }
    useApp.getState().updateLastAssistant(chatId, acc, { crisis: !!crisis, demo });
    return { crisis, demo, notice };
  } catch {
    const es = app.settings.locale === "es";
    useApp.getState().updateLastAssistant(chatId, es ? "Algo salió mal. Revisa tu internet e intenta de nuevo." : "Something went wrong. Check your internet and try again.");
    return {};
  }
}
