"use client";

import { useApp } from "./store";

/** Call one of our server API routes. Sends the (random) device ID used for daily limits. */
export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-device-id": useApp.getState().deviceId },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { "x-device-id": useApp.getState().deviceId } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export interface TaskResponse<T> {
  output?: T;
  demo?: boolean;
  notice?: string;
  crisis?: string;
  blocked?: boolean;
}

/** Run an AI task on the server (plans, flashcards, resume...). Falls back to demo answers automatically. */
export async function runTask<T>(task: string, input: unknown): Promise<TaskResponse<T>> {
  const { profileSummary } = await import("./store");
  const app = useApp.getState();
  return apiPost<TaskResponse<T>>(`/api/ai/${task}`, { input, locale: app.settings.locale, profile: profileSummary(app) });
}
