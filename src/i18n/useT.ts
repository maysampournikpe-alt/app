"use client";

import { useCallback } from "react";
import { useApp } from "@/lib/store";
import { getLocaleInfo, type Localized } from "./config";
import { pickLocalized, translate, type Vars } from "./translate";

/** React hook: const { t, L, locale } = useT(); t("find.greeting") */
export function useT() {
  const locale = useApp((s) => s.settings.locale);
  const t = useCallback((key: string, vars?: Vars) => translate(locale, key, vars), [locale]);
  const L = useCallback((obj: Localized | string | undefined) => pickLocalized(obj, locale), [locale]);
  const info = getLocaleInfo(locale);
  return { t, L, locale, dateLocale: info.dateLocale, speechLang: info.speechLang };
}
