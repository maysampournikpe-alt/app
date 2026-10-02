"use client";

import { useApp } from "./store";

/** The codes this device has (from the Me tab), sent so the server can check access. */
export function peopleCodes() {
  const p = useApp.getState().profile;
  return { code: p.schoolCode, parentCode: p.parentCode, mentorCode: p.mentorCode };
}

export function peopleQuery(extra: Record<string, string> = {}) {
  const c = peopleCodes();
  const q = new URLSearchParams(extra);
  if (c.code) q.set("code", c.code);
  if (c.parentCode) q.set("parent", c.parentCode);
  if (c.mentorCode) q.set("mentor", c.mentorCode);
  return q.toString();
}

export interface PeopleGroup {
  slug: string;
  kind: "study" | "team" | "mentor" | "school" | "carpool" | "alumni" | "shared_plan";
  school: boolean;
  name: string;
  nameEs?: string | null;
  description?: string | null;
  descEs?: string | null;
  posts: number;
}

export interface PeoplePost {
  id: string;
  nickname: string;
  role: "student" | "staff" | "mentor" | "parent";
  kind: string;
  body: string;
  meta: { needs?: string[]; competition?: string } | null;
  createdAt: string;
  mine: boolean;
  replies?: PeoplePost[];
}

/** POST to /api/people/posts and turn errors into a message key. */
export async function sendPost(body: Record<string, unknown>): Promise<{ ok: true; removed: string[] } | { ok: false; error: string }> {
  const res = await fetch("/api/people/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-device-id": useApp.getState().deviceId },
    body: JSON.stringify({ ...peopleCodes(), nickname: useApp.getState().profile.nickname, ...body }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; removed?: string[] };
  if (!res.ok) return { ok: false, error: data.error ?? "error" };
  return { ok: true, removed: data.removed ?? [] };
}
