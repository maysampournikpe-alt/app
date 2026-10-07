"use client";

import { ShieldCheck } from "lucide-react";
import { useT } from "@/i18n/useT";

/** The People safety rules, in plain words. */
export function SafetyRules() {
  const { t } = useT();
  return (
    <details className="rounded-xl border border-border bg-surface p-4">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
        <ShieldCheck aria-hidden="true" className="size-5 text-success" />
        {t("people.rulesTitle")}
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}>{t(`people.rule${n}`)}</li>
        ))}
      </ul>
    </details>
  );
}
