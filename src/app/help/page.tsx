"use client";

import Link from "next/link";
import { Phone, MessageSquare, ExternalLink, HeartHandshake } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { HELPLINES } from "@/data/helplines";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/** Trusted help lines and the student's school counselor (Phase 7.3 / Safety). */
export default function HelpPage() {
  const { t, L, locale } = useT();
  const profile = useApp((s) => s.profile);
  return (
    <div>
      <PageHeader title={t("help.title")} icon={<HeartHandshake className="size-7" />} subtitle={t("help.intro")} />
      <Alert tone="danger" className="mb-4">
        <span className="text-base font-bold">{t("help.urgent")}</span>
      </Alert>

      <Card className="mb-4">
        <h2 className="text-lg font-bold">{t("help.counselorTitle")}</h2>
        {profile.counselorName || profile.counselorContact ? (
          <p className="mt-1">
            <span className="font-bold">{profile.counselorName}</span>
            {profile.counselorContact && <span className="block text-muted">{profile.counselorContact}</span>}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">{t("help.counselorHelp")}</p>
            <Link href="/me/profile" className="mt-2 inline-block font-bold text-primary underline underline-offset-4">
              {t("help.counselorEdit")}
            </Link>
          </>
        )}
        <p className="mt-3 text-sm">{t("help.trustedAdult")}</p>
      </Card>

      <ul className="space-y-3">
        {HELPLINES.map((h) => {
          const word = locale === "es" ? h.text?.wordEs ?? h.text?.word : h.text?.word;
          return (
            <li key={h.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold">{L(h.name)}</h2>
                  {h.spanish && <Badge tone="primary">{t("help.spanish")}</Badge>}
                </div>
                <p className="mt-1">{L(h.what)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {h.call && (
                    <a href={`tel:${h.call.replace(/[^\d]/g, "")}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-on-primary">
                      <Phone aria-hidden="true" className="size-4" />
                      {t("help.call", { n: h.call })}
                    </a>
                  )}
                  {h.text && (
                    <a
                      href={`sms:${h.text.number.replace(/[^\d]/g, "")}${word ? `?&body=${encodeURIComponent(word)}` : ""}`}
                      className="inline-flex min-h-11 items-center gap-2 press rounded-2xl border-2 border-b-4 border-border bg-surface px-4 font-display text-sm font-extrabold hover:bg-surface-2 active:border-b-2"
                    >
                      <MessageSquare aria-hidden="true" className="size-4" />
                      {word ? t("help.text", { word, n: h.text.number }) : t("help.textOnly", { n: h.text.number })}
                    </a>
                  )}
                  <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-bold text-primary underline underline-offset-4">
                    {t("help.website")}
                    <ExternalLink aria-hidden="true" className="size-4" />
                    <span className="sr-only">{t("common.externalLink")}</span>
                  </a>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
