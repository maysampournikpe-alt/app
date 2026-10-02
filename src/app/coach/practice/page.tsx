"use client";

import { Puzzle, Layers, Languages, ClipboardCheck, Mic, BookOpen } from "lucide-react";
import { useT } from "@/i18n/useT";
import { PageHeader } from "@/components/ui/misc";
import { LinkCard } from "@/components/ui/Card";
import { BackLink } from "@/components/explore/common";

/** Practice & skills hub (Phase 4). */
export default function PracticePage() {
  const { t } = useT();
  return (
    <div>
      <BackLink href="/coach" label={t("coach.title")} />
      <PageHeader title={t("skills.practiceTitle")} subtitle={t("skills.practiceSub")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard href="/coach/daily" icon={<Puzzle className="size-5" />} title={t("skills.daily")} subtitle={t("skills.dailySub")} />
        <LinkCard href="/coach/flashcards" icon={<Layers className="size-5" />} title={t("skills.flashcards")} subtitle={t("skills.flashcardsSub")} />
        <LinkCard href="/coach/tests" icon={<ClipboardCheck className="size-5" />} title={t("skills.tests")} subtitle={t("skills.testsSub")} />
        <LinkCard href="/coach/speaking" icon={<Mic className="size-5" />} title={t("skills.speaking")} subtitle={t("skills.speakingSub")} />
        <LinkCard href="/coach/courses" icon={<BookOpen className="size-5" />} title={t("skills.courses")} subtitle={t("skills.coursesSub")} />
        <LinkCard href="/coach?mode=language" icon={<Languages className="size-5" />} title={t("skills.language")} subtitle={t("skills.languageSub")} />
      </div>
    </div>
  );
}
