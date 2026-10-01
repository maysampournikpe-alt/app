"use client";

import { useT } from "@/i18n/useT";
import { PageHeader } from "@/components/ui/misc";
import { LinkCard } from "@/components/ui/Card";
import { BackLink } from "@/components/explore/common";
import { EXPLORE_LINKS } from "@/components/explore/links";



/** Explore hub (Phase 3.2 Career and college, Phase 8 Money and access). */
export default function ExplorePage() {
  const { t } = useT();
  return (
    <div>
      <BackLink href="/" label={t("nav.find")} />
      <PageHeader title={t("explore.title")} subtitle={t("explore.subtitle")} />
      <div className="grid gap-3 sm:grid-cols-2">
        {EXPLORE_LINKS.map(({ href, key, icon: Icon }) => (
          <LinkCard key={href} href={href} icon={<Icon className="size-5" />} title={t(`explore.${key}`)} subtitle={t(`explore.${key}Sub`)} />
        ))}
      </div>
    </div>
  );
}
