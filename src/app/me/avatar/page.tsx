"use client";

import { Lock } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp, type AvatarConfig } from "@/lib/store";
import { AVATAR_UNLOCKS, levelFromXp } from "@/lib/gamification";
import { PageHeader, SectionTitle } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/me/Avatar";
import { BackLink } from "@/components/explore/common";
import { cn } from "@/lib/utils";

const PARTS = [
  { key: "color", label: "fun.avatarColor", items: AVATAR_UNLOCKS.colors },
  { key: "face", label: "fun.avatarFace", items: AVATAR_UNLOCKS.faces },
  { key: "hat", label: "fun.avatarHat", items: AVATAR_UNLOCKS.hats },
  { key: "frame", label: "fun.avatarFrame", items: AVATAR_UNLOCKS.frames },
] as const;

/** 9.6 Avatar customization: items unlock as the student levels up from real achievements. */
export default function AvatarPage() {
  const { t } = useT();
  const avatar = useApp((s) => s.avatar);
  const setAvatar = useApp((s) => s.setAvatar);
  const level = levelFromXp(useApp((s) => s.xp)).level;
  return (
    <div>
      <BackLink href="/me" label={t("me.title")} />
      <PageHeader title={t("fun.avatarTitle")} subtitle={t("fun.avatarSub")} />
      <Card className="mb-4 flex items-center gap-4">
        <Avatar config={avatar} size="lg" />
        <p className="text-lg font-bold">{t("fun.yourLevel", { n: level })}</p>
      </Card>
      {PARTS.map((part) => (
        <section key={part.key} aria-labelledby={`av-${part.key}`}>
          <SectionTitle id={`av-${part.key}`}>{t(part.label)}</SectionTitle>
          <div role="radiogroup" aria-labelledby={`av-${part.key}`} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {part.items.map((item) => {
              const locked = item.level > level;
              const selected = avatar[part.key as keyof AvatarConfig] === item.id;
              const preview: AvatarConfig = { ...avatar, [part.key]: item.id };
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={locked}
                  aria-label={`${t(`fun.item_${item.id}`)}${locked ? ` — ${t("fun.unlockAt", { n: item.level })}` : ""}`}
                  onClick={() => !locked && setAvatar({ [part.key]: item.id })}
                  className={cn(
                    "flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center text-xs",
                    selected ? "border-primary bg-primary-soft" : "border-border bg-surface",
                    locked ? "cursor-not-allowed" : "hover:border-primary",
                  )}
                >
                  <span className={cn("relative", locked && "opacity-40 grayscale")}>
                    <Avatar config={preview} size="sm" />
                  </span>
                  <span className="font-bold">{t(`fun.item_${item.id}`)}</span>
                  {locked && (
                    <span className="flex items-center gap-0.5 text-muted">
                      <Lock aria-hidden="true" className="size-3" /> {t("me.level", { n: item.level })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
