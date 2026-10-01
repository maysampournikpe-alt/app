"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Settings2 } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { IconButton } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { LanguageToggle } from "./LanguageToggle";
import { SettingsControls } from "./QuickSettings";
import { Logo } from "./Logo";
import { formatRelative } from "@/lib/time";

export function Header({ minimal }: { minimal?: boolean }) {
  const { t, locale } = useT();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const notifications = useApp((s) => s.notifications);
  const markRead = useApp((s) => s.markNotificationsRead);
  const clear = useApp((s) => s.clearNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 lg:pl-60">
        <Link href="/" aria-label={t("nav.home")} className="mr-auto flex items-center gap-2 rounded-lg">
          <Logo className="size-9" />
          <span className="text-xl font-bold tracking-tight">{t("common.appName")}</span>
        </Link>
        <LanguageToggle />
        {!minimal && (
          <IconButton
            label={unread ? `${t("common.notifications")} (${unread})` : t("common.notifications")}
            onClick={() => {
              setBellOpen(true);
            }}
            className="relative"
          >
            <Bell aria-hidden="true" className="size-6" />
            {unread > 0 && (
              <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white dark:text-black">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </IconButton>
        )}
        <IconButton label={t("nav.quickSettings")} onClick={() => setSettingsOpen(true)}>
          <Settings2 aria-hidden="true" className="size-6" />
        </IconButton>
      </div>

      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t("nav.quickSettings")} closeLabel={t("common.close")}>
        <SettingsControls compact />
      </Sheet>

      <Sheet
        open={bellOpen}
        onClose={() => {
          setBellOpen(false);
          markRead();
        }}
        title={t("common.notifications")}
        closeLabel={t("common.close")}
      >
        {notifications.length === 0 ? (
          <p className="text-muted">{t("common.noNotifications")}</p>
        ) : (
          <>
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-xl border border-border p-3">
                  {n.href ? (
                    <Link href={n.href} onClick={() => setBellOpen(false)} className="font-bold underline-offset-4 hover:underline">
                      {!n.read && <span className="mr-1 inline-block size-2 rounded-full bg-accent align-middle" aria-hidden="true" />}
                      {n.text}
                    </Link>
                  ) : (
                    <p className="font-bold">{n.text}</p>
                  )}
                  <p className="text-xs text-muted">{formatRelative(n.at, locale)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <button type="button" className="font-bold text-primary underline underline-offset-4" onClick={clear}>
                {t("common.clearAll")}
              </button>
            </div>
          </>
        )}
      </Sheet>
    </header>
  );
}
