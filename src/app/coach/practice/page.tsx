"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/i18n/useT";
import { PageHeader } from "@/components/ui/misc";

/** Practice & skills hub (Phase 4). */
export default function PracticePage() {
  const { t } = useT();
  return (
    <div>
      <Link href="/coach" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("coach.title")}
      </Link>
      <PageHeader title={t("coach.practiceTitle")} subtitle={t("coach.practiceSub")} />
    </div>
  );
}
