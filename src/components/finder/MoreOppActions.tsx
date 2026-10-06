"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, FileImage } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FLYER_KEY } from "./flyer-key";

/** More actions on an opportunity: printable flyer (9.8) and event buddy (6.7). */
export function MoreOppActions({ opp }: { opp: Opportunity }) {
  const { t } = useT();
  const router = useRouter();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<FileImage aria-hidden="true" className="size-4" />}
        onClick={() => {
          try {
            sessionStorage.setItem(FLYER_KEY, JSON.stringify(opp));
          } catch {
            /* the flyer page can still find saved items by id */
          }
          router.push(`/flyer?id=${encodeURIComponent(opp.id)}`);
        }}
      >
        {t("fun.flyer")}
      </Button>
      <EventBuddy opp={opp} />
    </>
  );
}

/** 6.7 Event buddy: see which classmates in your school group are going (nicknames only). */
function EventBuddy({ opp }: { opp: Opportunity }) {
  const { t } = useT();
  const code = useApp((s) => s.profile.schoolCode);
  const nickname = useApp((s) => s.profile.nickname);
  const peopleOff = useApp((s) => s.consent.under13 && !s.parental.peopleEnabled);
  const [state, setState] = useState<{ nicknames: string[]; me: boolean } | null>(null);
  const key = opp.id.slice(0, 80);

  const load = useCallback(() => {
    if (!code) return;
    apiGet<{ nicknames: string[]; me: boolean }>(`/api/people/going?code=${encodeURIComponent(code)}&key=${encodeURIComponent(key)}`)
      .then(setState)
      .catch(() => setState(null));
  }, [code, key]);
  useEffect(load, [load]);

  if (peopleOff) return null;
  return (
    <section aria-labelledby={`buddy-${key}`} className="rounded-2xl border border-border p-3">
      <h3 id={`buddy-${key}`} className="flex items-center gap-2 font-bold">
        <UserCheck aria-hidden="true" className="size-5 text-primary" />
        {t("people.buddyTitle")}
      </h3>
      {!code ? (
        <p className="text-sm text-muted">{t("people.buddyJoin")}</p>
      ) : (
        <>
          <p className="text-sm text-muted">{t("people.buddyHelp")}</p>
          <p className="mt-1 text-sm" aria-live="polite">
            {state && state.nicknames.length > 0 ? t("people.buddyOthers", { count: state.nicknames.length, names: state.nicknames.slice(0, 6).join(", ") }) : t("people.buddyNone")}
          </p>
          <Button
            variant={state?.me ? "ghost" : "soft"}
            size="sm"
            className="mt-2"
            aria-pressed={!!state?.me}
            onClick={async () => {
              await apiPost("/api/people/going", { code, key, title: opp.title, nickname, going: !state?.me }).catch(() => {});
              load();
            }}
          >
            {state?.me ? t("people.buddyNotGoing") : t("people.buddyGoing")}
          </Button>
        </>
      )}
    </section>
  );
}
