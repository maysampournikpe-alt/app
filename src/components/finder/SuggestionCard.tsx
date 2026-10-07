"use client";

import { useState } from "react";
import { HelpCircle, ExternalLink, Copy, Check, Mail, Phone } from "lucide-react";
import type { Suggestion } from "@/types";
import { useT } from "@/i18n/useT";
import { Badge } from "@/components/ui/Badge";

function CopyBlock({ label, text, icon }: { label: string; text: string; icon: React.ReactNode }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  return (
    <details className="group rounded-xl border border-border">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 font-bold">
        {icon}
        {label}
        <span aria-hidden="true" className="ml-auto text-muted group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="border-t border-border p-3">
        <pre className="whitespace-pre-wrap font-sans text-sm">{text}</pre>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* clipboard blocked */
            }
          }}
          className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-sm font-bold"
        >
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          <span aria-live="polite">{copied ? t("common.copied") : `${t("common.copy")}: ${label}`}</span>
        </button>
      </div>
    </details>
  );
}

/** "Not a confirmed listing" — a place that might offer the opportunity, with scripts to contact it. */
export function SuggestionCard({ s }: { s: Suggestion }) {
  const { t } = useT();
  return (
    <article className="rounded-xl border border-dashed bg-surface p-4">
      <Badge tone="warning" icon={<HelpCircle aria-hidden="true" className="size-3.5" />}>
        {t("find.notConfirmed")}
      </Badge>
      <h3 className="mt-2 text-lg font-bold">{s.name}</h3>
      <p className="text-sm text-muted">
        {s.kind}
        {s.city ? ` · ${s.city}` : ""}
      </p>
      <p className="mt-2 text-sm">{s.why}</p>
      {s.howToFind && (
        <p className="mt-1 text-sm">
          <span className="font-bold">{t("find.howToFind")}: </span>
          {s.howToFind}
        </p>
      )}
      {s.website && (
        <a href={s.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-primary underline underline-offset-4">
          {s.website.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
          <ExternalLink aria-hidden="true" className="size-4" />
          <span className="sr-only">{t("common.externalLink")}</span>
        </a>
      )}
      <div className="mt-3 space-y-2">
        <CopyBlock label={t("find.emailScript")} text={s.emailScript} icon={<Mail aria-hidden="true" className="size-4" />} />
        <CopyBlock label={t("find.phoneScript")} text={s.phoneScript} icon={<Phone aria-hidden="true" className="size-4" />} />
      </div>
      <p className="mt-2 text-xs text-muted">{t("find.scriptTip")}</p>
    </article>
  );
}
