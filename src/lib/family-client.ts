"use client";

import type { Opportunity, SavedItem } from "@/types";
import { apiGet, apiPost } from "./api";
import { useApp } from "./store";

export interface ShareItem {
  title: string;
  organization?: string;
  category: string;
  costText?: string;
  free?: boolean;
  deadline?: string;
  dateText?: string;
  where?: string;
  sourceUrl?: string;
  status?: string;
}

/** Only the facts a parent needs. Never the student's name or notes. */
export function toShareItem(o: Opportunity, status?: string): ShareItem {
  return {
    title: o.title,
    organization: o.organization || undefined,
    category: o.category,
    costText: o.cost.text ?? o.cost.feeWaiver,
    free: o.cost.type === "free",
    deadline: o.deadline,
    dateText: o.dateText ?? (o.startDate ? o.startDate : undefined),
    where: o.mode === "online" ? "online" : [o.address, o.city].filter(Boolean).join(", ") || undefined,
    sourceUrl: o.sourceUrl,
    status,
  };
}

export async function createParentLink(kind: "summary" | "approval", items: ShareItem[]): Promise<string> {
  const locale = useApp.getState().settings.locale;
  const { token } = await apiPost<{ token: string }>("/api/parent", { kind, locale, items });
  return `${window.location.origin}/parent/${token}`;
}

/** Ask the server whether the parent answered, and save the answer on this device. */
export async function refreshParentDecision(item: SavedItem): Promise<SavedItem["parentDecision"]> {
  if (!item.parentShareToken) return item.parentDecision;
  try {
    const res = await apiGet<{ decision?: "approved" | "declined" | null; parentNote?: string | null }>(`/api/parent/${item.parentShareToken}`);
    if (res.decision && res.decision !== item.parentDecision) {
      const app = useApp.getState();
      app.updateSaved(item.id, { parentDecision: res.decision, notes: res.parentNote ? `${item.notes ? `${item.notes}\n` : ""}👪 ${res.parentNote}` : item.notes });
      return res.decision;
    }
  } catch {
    /* offline — try later */
  }
  return item.parentDecision;
}
