"use client";

import { Sparkles, Search, ShieldCheck, Ban, HelpCircle, PiggyBank, FlaskConical, HeartHandshake } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/i18n/useT";
import { PageHeader } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { ReadAloudButton } from "@/components/a11y/ReadAloudButton";

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
        <span aria-hidden="true" className="text-primary">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** 10.7 Transparency: how the AI finds results and what its limits are, in simple words. */
export default function HowAiWorksPage() {
  const { t } = useT();
  const keys = ["intro", "findTitle", "find1", "find2", "find3", "find4", "find5", "find6", "limitsTitle", "limit1", "limit2", "limit3", "limit4", "limit5", "suggestTitle", "suggest", "costTitle", "cost", "demoTitle", "demo", "safetyTitle", "safety"];
  return (
    <div>
      <PageHeader title={t("ai.title")} subtitle={t("ai.intro")} icon={<Sparkles className="size-7" />} />
      <div className="mb-4">
        <ReadAloudButton text={keys.map((k) => t(`ai.${k}`)).join(". ")} />
      </div>
      <div className="space-y-3">
        <Section icon={<Search className="size-5" />} title={t("ai.findTitle")}>
          <ol className="list-decimal space-y-1.5 pl-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <li key={n} className={n === 5 ? "font-bold" : undefined}>
                {t(`ai.find${n}`)}
              </li>
            ))}
          </ol>
        </Section>
        <Section icon={<Ban className="size-5" />} title={t("ai.limitsTitle")}>
          <ul className="list-disc space-y-1.5 pl-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n}>{t(`ai.limit${n}`)}</li>
            ))}
          </ul>
        </Section>
        <Section icon={<HelpCircle className="size-5" />} title={t("ai.suggestTitle")}>
          <p>{t("ai.suggest")}</p>
        </Section>
        <Section icon={<HeartHandshake className="size-5" />} title={t("ai.safetyTitle")}>
          <p>{t("ai.safety")}</p>
        </Section>
        <Section icon={<PiggyBank className="size-5" />} title={t("ai.costTitle")}>
          <p>{t("ai.cost")}</p>
        </Section>
        <Section icon={<FlaskConical className="size-5" />} title={t("ai.demoTitle")}>
          <p>{t("ai.demo")}</p>
        </Section>
        <p className="flex items-center gap-2 text-sm text-muted">
          <ShieldCheck aria-hidden="true" className="size-4" />
          {t("privacy.updated")}
        </p>
      </div>
    </div>
  );
}
