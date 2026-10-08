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
    <div role="group" aria-label={t("nav.changeLanguage")} className="flex rounded-md border-2 border-white/80">
      {shown.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={locale === l.code}
          aria-label={l.name}
          onClick={() => setSettings({ locale: l.code })}
          className={cn(
            "min-h-9 min-w-10 px-2.5 font-display text-sm uppercase",
            locale === l.code ? "bg-block text-ink" : "text-white hover:bg-white/15",
          )}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
