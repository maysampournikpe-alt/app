"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useT } from "@/i18n/useT";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";

/** 1.5 Safety: plain-language privacy page (English and Spanish). */
export default function PrivacyPage() {
  const { t } = useT();
  const sections = [1, 2, 3, 4, 5, 6, 7, 8];
  const allText = [t("privacy.title"), t("privacy.short"), ...sections.flatMap((n) => [t(`privacy.s${n}t`), t(`privacy.s${n}`)])].join(". ");
  return (
    <article>
      <PageHeader title={t("privacy.title")} subtitle={t("privacy.updated")} icon={<Lock className="size-7" />} />
      <div className="mb-4">
        <ReadAloudButton text={allText} />
      </div>
      <Alert tone="success" className="mb-5 text-base">
        <span className="text-base font-bold">{t("privacy.short")}</span>
      </Alert>
      <div className="space-y-3">
        {sections.map((n) => (
          <Card key={n}>
            <h2 className="mb-1 text-lg font-bold">{t(`privacy.s${n}t`)}</h2>
            <p>{t(`privacy.s${n}`)}</p>
          </Card>
        ))}
      </div>
      <p className="mt-5">
        <Link href="/how-ai-works" className="font-bold text-primary underline underline-offset-4">
          {t("privacy.aiLink")}
        </Link>
      </p>
    </article>
  );
}
