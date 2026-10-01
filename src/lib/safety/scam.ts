// Rule-based scam check (Safety 1.5.5). This is a SECOND layer of protection:
// the AI is also told to flag scams, but rules can't be talked out of things.
// Returns short codes; the app shows a friendly explanation for each code.
import type { Opportunity } from "@/types";

export type ScamCode =
  | "upfront_fee"
  | "scholarship_fee"
  | "sensitive_info"
  | "odd_payment"
  | "too_good"
  | "pressure"
  | "chat_only"
  | "sketchy_link";

const RULES: { code: ScamCode; test: (text: string, o: Partial<Opportunity>) => boolean }[] = [
  {
    // Real jobs pay YOU. They don't charge for training, kits, or "registration".
    code: "upfront_fee",
    test: (t, o) =>
      (o.category === "job" || o.category === "internship" || o.paid === true) &&
      /\b(starter kit|training fee|registration fee|processing fee|pay (a|the|your)? ?(fee|deposit)|deposit required|buy (a|your) (kit|equipment) first|cuota de inscripci[oó]n|pagar (una )?cuota|dep[oó]sito)\b/i.test(t),
  },
  {
    // Legit scholarships are free to apply for.
    code: "scholarship_fee",
    test: (t, o) =>
      o.category === "scholarship" &&
      (/\b(application|processing|service|handling) fee\b/i.test(t) || /\bcuota (de )?(solicitud|tr[aá]mite)\b/i.test(t) || (o.cost?.type === "paid" && !/waiver/i.test(t))),
  },
  {
    code: "sensitive_info",
    test: (t) =>
      /\b(social security( number)?|ssn|bank account|routing number|credit card number|debit card|password|pin number|n[uú]mero de seguro social|cuenta (de )?banco|tarjeta de cr[eé]dito|contrase[nñ]a)\b/i.test(t),
  },
  {
    code: "odd_payment",
    test: (t) => /\b(gift ?cards?|wire transfer|western union|moneygram|bitcoin|crypto(currency)?|zelle|cash ?app|venmo|tarjetas? de regalo|giro)\b/i.test(t),
  },
  {
    code: "too_good",
    test: (t) =>
      /\bguarantee(d)?\b.{0,40}\b(job|income|money|scholarship|win|acceptance|pay)\b/i.test(t) ||
      /\b(easy money|get rich|be your own boss|dinero f[aá]cil|ganancias garantizadas|garantizad[oa])\b/i.test(t) ||
      /\$\s?([5-9]\d|\d{3,})(\.\d+)?\s?(\/|per |an |a )?\s?(hour|hr)\b/i.test(t) ||
      /\$\s?\d{3,}\s?(\/|per |a )\s?day\b.{0,40}\b(no experience|from home)\b/i.test(t),
  },
  {
    code: "pressure",
    test: (t) => /\b(act now|today only|only \d+ spots? left.{0,20}pay|respond within \d+ (hours|minutes)|urgent(ly)? hiring.{0,30}no interview|s[oó]lo hoy|act[uú]a ya)\b/i.test(t),
  },
  {
    code: "chat_only",
    test: (t) => /\b(whatsapp|telegram|signal app|dm us|message us on (instagram|tiktok|snapchat)|text this number to apply|escr[ií]benos por (whatsapp|instagram))\b/i.test(t),
  },
  {
    code: "sketchy_link",
    test: (_t, o) => {
      const url = o.sourceUrl ?? "";
      if (!url) return false;
      if (/^http:\/\//i.test(url)) return true;
      return /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|rb\.gy|cutt\.ly|forms\.gle)\b/i.test(url);
    },
  },
];

/** Check one opportunity. Returns the list of warning codes (empty = nothing found). */
export function scamCheck(o: Partial<Opportunity>): ScamCode[] {
  const text = [o.title, o.organization, o.description, o.cost?.text, o.payText, o.eligibility, o.dateText, o.transitNote]
    .filter(Boolean)
    .join(" \n ");
  return RULES.filter((r) => r.test(text, o)).map((r) => r.code);
}
