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
