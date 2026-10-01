// Content filter for anything students post (People tab, reviews, notes) — Phase 6 safety.
//  1. Personal info is REMOVED automatically: phone numbers, emails, street addresses,
//     social media handles and links. (Students are minors; strangers must not get these.)
//  2. Posts with profanity, bullying or sexual content are BLOCKED with a friendly message.
// This runs on the server, so it can't be skipped.

export type Removed = "phone" | "email" | "address" | "social" | "link";

const PATTERNS: { kind: Removed; re: RegExp }[] = [
  { kind: "email", re: /[A-Z0-9._%+-]+\s*(@|\(at\)|\[at\])\s*[A-Z0-9.-]+\s*(\.|\(dot\)|\[dot\])\s*[A-Z]{2,}/gi },
  { kind: "link", re: /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|gg|me|ly|co|app|tv|us)\b(?:\/\S*)?/gi },
  // Phone numbers: 956-555-1234, (956) 555 1234, 9565551234, +1 956..., 555-1234
  { kind: "phone", re: /(?:\+?1[\s.-]*)?(?:\(\d{3}\)|\b\d{3})[\s.-]*\d{3}[\s.-]*\d{4}\b|\b\d{3}[\s.-]\d{4}\b/g },
  // Street addresses: "1234 N Main St", "500 calle 10"
  {
    kind: "address",
    re: /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?(?:[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+\s){0,3}(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pkwy|hwy|highway|calle|avenida|camino|carretera)\b\.?/gi,
  },
  // Social handles: "@maria_r", "my snap is maria22", "ig: maria", "discord maria#1234"
  {
    kind: "social",
    re: /(?:^|\s)@[A-Za-z0-9_.]{2,}|\b(?:snap(?:chat)?|insta(?:gram)?|ig|tiktok|tt|discord|twitter|x|facebook|fb|whatsapp|telegram|kik|roblox)\s*(?:is|es|:|-|=|@)?\s*@?[A-Za-z0-9_.#]{3,}/gi,
  },
];

const PROFANITY = /\b(fuck\w*|shit\w*|bitch\w*|asshole|bastard|dick|pussy|cunt|slut|whore|fag\w*|retard\w*|nigg\w*|puta|puto|pendej\w*|chinga\w*|cabr[oó]n\w*|verga|mierda|culero|pinche|joto|maric[oó]n)\b/i;
const BULLYING = /\b(kys|kill yourself|go die|you('| a)?re (so )?(ugly|fat|stupid|dumb|worthless|a loser)|nobody likes you|everyone hates you|m[aá]tate|nadie te quiere|eres (fe[oa]|gord[oa]|tont[oa]|est[uú]pid[oa]))\b/i;
const SEXUAL = /\b(sex|sexy|nudes?|naked|porn\w*|horny|send pics|desnud[oa]s?|porno)\b/i;
const MEETUP = /\b(meet me (alone|at my house)|come to my house|v[eé]n a mi casa|nos vemos a solas)\b/i;

export interface ModerationResult {
  text: string;
  removed: Removed[];
  blocked: boolean;
  reason?: "profanity" | "bullying" | "sexual" | "meetup";
}

export function moderateText(input: string): ModerationResult {
  let text = input.replace(/\s+\n/g, "\n").trim();
  const removed = new Set<Removed>();
  for (const p of PATTERNS) {
    text = text.replace(p.re, (m) => {
      removed.add(p.kind);
      // Keep a leading space if the match started with one.
      return `${/^\s/.test(m) ? " " : ""}[removed]`;
    });
  }
  let reason: ModerationResult["reason"];
  if (PROFANITY.test(input)) reason = "profanity";
  else if (BULLYING.test(input)) reason = "bullying";
  else if (SEXUAL.test(input)) reason = "sexual";
  else if (MEETUP.test(input)) reason = "meetup";
  return { text, removed: [...removed], blocked: !!reason, reason };
}

/** Nicknames: letters, numbers, spaces, _ and - only; no bad words; no personal info. */
export function cleanNickname(raw: string | undefined): string | null {
  const n = (raw ?? "").normalize("NFC").replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 24);
  if (n.length < 2) return null;
  if (PROFANITY.test(n) || SEXUAL.test(n)) return null;
  if (/\d{5,}/.test(n)) return null; // looks like a phone number
  return n;
}
