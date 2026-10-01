"use client";

import Link from "next/link";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { LOCALES } from "@/i18n/config";
import { Toggle } from "@/components/ui/Toggle";
import { Segmented } from "@/components/ui/misc";
import { Chip } from "@/components/ui/Chip";
import type { Settings } from "@/types";

/** Accessibility + display settings. Used in the header pop-up and on the Settings page. */
export function SettingsControls({ compact }: { compact?: boolean }) {
  const { t } = useT();
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-bold">{t("settings.theme")}</p>
        <Segmented<Settings["theme"]>
          label={t("settings.theme")}
          value={settings.theme}
          onChange={(theme) => setSettings({ theme })}
          options={[
            { value: "system", label: t("settings.themeSystem") },
            { value: "light", label: t("settings.themeLight") },
            { value: "dark", label: t("settings.themeDark") },
          ]}
        />
      </div>
      <div>
        <p className="mb-2 font-bold" id="lang-label">
          {t("settings.language")}
        </p>
        <div role="group" aria-labelledby="lang-label" className="flex flex-wrap gap-2">
          {LOCALES.map((l) => (
            <Chip key={l.code} selected={settings.locale === l.code} onClick={() => setSettings({ locale: l.code })}>
              <span lang={l.code}>{l.name}</span>
              {l.beta && <span className="text-xs opacity-80">({t("common.beta")})</span>}
            </Chip>
          ))}
        </div>
        {!compact && <p className="mt-1 text-sm text-muted">{t("settings.languageHelp")}</p>}
      </div>
      <div className="divide-y divide-border">
        <Toggle checked={settings.dyslexiaFont} onChange={(v) => setSettings({ dyslexiaFont: v })} label={t("settings.dyslexia")} help={compact ? undefined : t("settings.dyslexiaHelp")} />
        <Toggle checked={settings.largeText} onChange={(v) => setSettings({ largeText: v })} label={t("settings.largeText")} help={compact ? undefined : t("settings.largeTextHelp")} />
        <Toggle checked={settings.lowData} onChange={(v) => setSettings({ lowData: v })} label={t("settings.lowData")} help={t("settings.lowDataHelp")} />
        <Toggle checked={settings.onlineOnly} onChange={(v) => setSettings({ onlineOnly: v })} label={t("settings.onlineOnly")} help={compact ? undefined : t("settings.onlineOnlyHelp")} />
      </div>
      {compact && (
        <Link href="/me/settings" className="inline-block font-bold text-primary underline underline-offset-4">
          {t("settings.more")}
        </Link>
      )}
    </div>
  );
}
