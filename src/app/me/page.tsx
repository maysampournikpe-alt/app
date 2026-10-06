"use client";

import { UserRound, Heart, Settings, ShieldCheck, Download, LifeBuoy, Lock, Sparkles, Flame } from "lucide-react";
import Link from "next/link";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { levelFromXp } from "@/lib/gamification";
import { Card, LinkCard } from "@/components/ui/Card";
import { ProgressBar, SectionTitle } from "@/components/ui/misc";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/me/Avatar";
import { MeExtraLinks } from "@/components/me/MeExtraLinks";

/** 1.4 Me tab: profile, saved, progress, settings and privacy controls. */
export default function MePage() {
  const { t } = useT();
  const s = useApp();
  const lvl = levelFromXp(s.xp);
  const savedCount = s.saved.length;
  return (
    <div>
      <Card className="mb-2 flex items-center gap-4">
        <Link href="/me/avatar" aria-label={t("me.editAvatar")} className="rounded-full">
          <Avatar config={s.avatar} size="lg" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{s.profile.nickname ? t("me.hello", { name: s.profile.nickname }) : t("me.helloAnon")}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="primary" icon={<Sparkles aria-hidden="true" className="size-3.5" />}>
              {t("me.level", { n: lvl.level })} · {t("me.xp", { n: s.xp })}
            </Badge>
            {s.streak.count > 0 && (
              <Badge tone="accent" icon={<Flame aria-hidden="true" className="size-3.5" />}>
                {t("me.streak", { count: s.streak.count })}
              </Badge>
            )}
          </div>
          <ProgressBar value={lvl.progress} label={t("me.toNext", { n: lvl.needed - lvl.into, level: lvl.level + 1 })} className="mt-2" tone="accent" />
          <p className="mt-1 text-xs text-muted">{t("me.toNext", { n: lvl.needed - lvl.into, level: lvl.level + 1 })}</p>
        </div>
      </Card>

      <SectionTitle>{t("me.sectionYou")}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard href="/me/saved" icon={<Heart className="size-5" />} title={t("me.saved")} subtitle={t("me.savedSub")} badge={savedCount ? <Badge tone="accent">{savedCount}</Badge> : undefined} />
        <LinkCard href="/me/profile" icon={<UserRound className="size-5" />} title={t("me.profile")} subtitle={t("me.profileSub")} />
        <MeExtraLinks />
      </div>

      <SectionTitle>{t("me.sectionApp")}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard href="/me/settings" icon={<Settings className="size-5" />} title={t("me.settings")} subtitle={t("me.settingsSub")} />
        <LinkCard href="/help" icon={<LifeBuoy className="size-5" />} title={t("me.help")} subtitle={t("me.helpSub")} />
        {s.consent.under13 && <LinkCard href="/me/parental" icon={<Lock className="size-5" />} title={t("me.parental")} subtitle={t("me.parentalSub")} />}
        <LinkCard href="/me/data" icon={<Download className="size-5" />} title={t("me.data")} subtitle={t("me.dataSub")} />
        <LinkCard href="/privacy" icon={<ShieldCheck className="size-5" />} title={t("me.privacy")} />
        <LinkCard href="/how-ai-works" icon={<Sparkles className="size-5" />} title={t("me.howAi")} />
      </div>
    </div>
  );
}
