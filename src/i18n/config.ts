// Languages the app supports.
// To add a language:
//   1. Copy messages/en.json to messages/<code>.json and translate it
//      (any missing words automatically fall back to English).
//   2. Add one line to LOCALES below and one import in src/i18n/messages.ts.

export interface LocaleInfo {
  code: string;
  /** Name of the language written in that language */
  name: string;
  /** Locale used for dates and numbers */
  dateLocale: string;
  /** Voice used for read-aloud and voice input */
  speechLang: string;
  /** Shown with a "beta" label because not every screen is translated yet */
  beta?: boolean;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", name: "English", dateLocale: "en-US", speechLang: "en-US" },
  { code: "es", name: "Español", dateLocale: "es-US", speechLang: "es-US" },
  { code: "vi", name: "Tiếng Việt", dateLocale: "vi-VN", speechLang: "vi-VN", beta: true },
];

export const DEFAULT_LOCALE = "en";

export function getLocaleInfo(code: string): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

/** Content written in several languages, e.g. { en: "Hello", es: "Hola" }. */
export type Localized = { en: string; es: string } & Partial<Record<string, string>>;
