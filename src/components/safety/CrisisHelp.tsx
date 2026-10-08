"use client";

import Link from "next/link";
import { Phone, MessageSquare, HeartHandshake } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { URGENT_HELPLINES } from "@/data/helplines";

/** Shown right away when a message suggests a student may be in danger. */
export function CrisisHelp() {
  const { t, L, locale } = useT();
  const profile = useApp((s) => s.profile);
  return (
    <section role="alert" aria-labelledby="crisis-title" className="rounded-xl border-2 border-danger/50 bg-danger-soft p-4 text-text">
      <h2 id="crisis-title" className="flex items-center gap-2 text-lg font-bold text-danger">
        <HeartHandshake aria-hidden="true" className="size-6" />
        {t("find.crisisTitle")}
      </h2>
      <p className="mt-1">{t("find.crisisBody")}</p>
      <ul className="mt-3 space-y-2">
        {URGENT_HELPLINES.map((h) => {
          const word = locale === "es" ? h.text?.wordEs ?? h.text?.word : h.text?.word;
          return (
            <li key={h.id} className="rounded-xl bg-surface p-3">
              <p className="font-bold">{L(h.name)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
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
              </div>
            </li>
          );
        })}
      </ul>
      {(profile.counselorName || profile.counselorContact) && (
        <p className="mt-3 rounded-xl bg-surface p-3">
          <span className="font-bold">{t("help.counselorTitle")}: </span>
          {[profile.counselorName, profile.counselorContact].filter(Boolean).join(" — ")}
        </p>
      )}
      <Link href="/help" className="mt-3 inline-block font-bold text-danger underline underline-offset-4">
        {t("find.crisisMore")}
      </Link>
    </section>
  );
}
