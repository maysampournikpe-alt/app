"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SettingsControls } from "@/components/layout/QuickSettings";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

/** Full settings page: accessibility, language, reminders, install. */
export default function SettingsPage() {
  const { t } = useT();
  const settings = useApp((s) => s.settings);
  const setSettings = useApp((s) => s.setSettings);
  const [installEvt, setInstallEvt] = useState<InstallEvent | null>(null);
  const standalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("settings.title")} />
      <Card className="mb-4">
        <h2 className="mb-3 text-lg font-bold">{t("settings.appearance")}</h2>
        <SettingsControls />
      </Card>
      <Card className="mb-4 space-y-4">
        <Field label={t("settings.readAloudSpeed")}>
          {(id) => (
            <Select id={id} value={settings.readAloudRate} onChange={(e) => setSettings({ readAloudRate: Number(e.target.value) })}>
              {[0.75, 1, 1.25, 1.5].map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Toggle checked={settings.inAppReminders} onChange={(v) => setSettings({ inAppReminders: v })} label={t("settings.reminders")} help={t("settings.remindersHelp")} />
        <Field label={t("settings.studyBreaks")}>
          {(id) => (
            <Select id={id} value={settings.studyBreakMinutes} onChange={(e) => setSettings({ studyBreakMinutes: Number(e.target.value) })}>
              <option value={0}>{t("settings.studyBreaksOff")}</option>
              {[25, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {t("settings.studyBreaksEvery", { n: m })}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">{t("settings.install")}</h2>
        {standalone ? (
          <p className="mt-1 text-success">{t("settings.installed")}</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">{t("settings.installHelp")}</p>
            {installEvt ? (
              <Button className="mt-3" icon={<Download aria-hidden="true" className="size-4" />} onClick={() => void installEvt.prompt()}>
                {t("settings.installButton")}
              </Button>
            ) : (
              <p className="mt-2 text-sm">{t("settings.installIos")}</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
