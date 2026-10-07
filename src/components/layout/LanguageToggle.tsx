"use client";

import { LOCALES } from "@/i18n/config";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The language toggle shown on every page. English and Spanish are one tap away;
 * other (beta) languages are in Settings, and show here when chosen.
 */
export function LanguageToggle() {
  const { t, locale } = useT();
  const setSettings = useApp((s) => s.setSettings);
  const shown = LOCALES.filter((l) => !l.beta || l.code === locale);
  return (
    <div role="group" aria-label={t("nav.changeLanguage")} className="flex rounded-lg bg-surface-2 p-1">
      {shown.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={locale === l.code}
          aria-label={l.name}
          onClick={() => setSettings({ locale: l.code })}
          className={cn(
            "min-h-9 min-w-10 rounded-md px-2.5 text-sm font-semibold uppercase transition-colors",
            locale === l.code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
