// The translator. Works on both the server and in the browser.
import { MESSAGES, type Messages } from "./messages";
import { DEFAULT_LOCALE, type Localized } from "./config";

export type Vars = Record<string, string | number | undefined>;
export type TFunction = (key: string, vars?: Vars) => string;

function lookup(messages: Messages | undefined, key: string): string | undefined {
  if (!messages) return undefined;
  let cur: unknown = messages;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Look up a key in a language, falling back to English, then to the key itself. */
export function translate(locale: string, key: string, vars?: Vars): string {
  let finalKey = key;
  // Plurals: if a count is given and "key_one"/"key_other" exist, pick the right one.
  if (vars && typeof vars.count === "number") {
    const rule = new Intl.PluralRules(locale).select(vars.count);
    const candidate = `${key}_${rule}`;
    if (lookup(MESSAGES[locale], candidate) ?? lookup(MESSAGES[DEFAULT_LOCALE], candidate)) finalKey = candidate;
    else if (lookup(MESSAGES[DEFAULT_LOCALE], `${key}_other`)) finalKey = `${key}_other`;
  }
  const raw = lookup(MESSAGES[locale], finalKey) ?? lookup(MESSAGES[DEFAULT_LOCALE], finalKey) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (vars[name] !== undefined ? String(vars[name]) : m));
}

export function makeT(locale: string): TFunction {
  return (key, vars) => translate(locale, key, vars);
}

/** Pick the right language from a { en, es, ... } object. */
export function pickLocalized(obj: Localized | string | undefined, locale: string): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[locale] ?? obj.en;
}
