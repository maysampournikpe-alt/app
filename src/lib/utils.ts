// Small helpers used all over the app.

/** Join CSS class names, skipping empty ones. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Random ID made of letters and numbers. */
export function uid(len = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  globalThis.crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

/** Today's date as YYYY-MM-DD in the student's local time. offsetDays shifts it. */
export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD as a local date (not UTC, so it doesn't shift a day). */
export function parseISODate(s?: string): Date | undefined {
  if (!s) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? undefined : d;
}

/** Whole days from today until the date (negative = in the past). */
export function daysUntil(s?: string): number | undefined {
  const d = parseISODate(s);
  if (!d) return undefined;
  const today = parseISODate(todayISO())!;
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

export function formatDate(s: string | undefined, locale: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = parseISODate(s);
  if (!d) return "";
  return d.toLocaleDateString(locale, opts ?? { month: "short", day: "numeric", year: "numeric" });
}

/** Simple, fast, non-cryptographic hash → short string. Used for stable IDs. */
export function shortHash(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Pick a stable "random" item for a given day (same for everyone that day). */
export function pickForDay<T>(items: T[], dayISO: string, salt = ""): T {
  const n = parseInt(shortHash(dayISO + salt), 36);
  return items[n % items.length];
}

/** Turn a list of words into a comma separated string, handling empty lists. */
export function joinList(items: (string | undefined)[], sep = ", "): string {
  return items.filter(Boolean).join(sep);
}

/** Download text as a file in the browser. */
export function downloadFile(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Simple SHA-256 hex (used for the parental-control PIN, never stored in plain text). */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
