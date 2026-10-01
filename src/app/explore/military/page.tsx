"use client";

import { Medal } from "lucide-react";
import { useT } from "@/i18n/useT";
import { MILITARY_GUIDE } from "@/data/guides";
import { MILITARY_BRANCHES } from "@/data/explore";
import { GuidePage, ExternalA } from "@/components/explore/common";
import { Card } from "@/components/ui/Card";

/** 3.2.9 Military and ROTC information. */
export default function MilitaryPage() {
  const { t } = useT();
  return (
    <div>
      <GuidePage title={t("explore.military")} subtitle={t("explore.militarySub")} icon={<Medal className="size-7" />} sections={MILITARY_GUIDE} />
      <Card className="mt-4">
        <ul className="flex flex-wrap gap-x-5">
          {MILITARY_BRANCHES.map((b) => (
            <li key={b.name}>
              <ExternalA href={b.url}>{b.name}</ExternalA>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
