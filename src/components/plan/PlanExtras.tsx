"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Copy } from "lucide-react";
import type { Plan } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiPost } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/misc";

/** 6.6 Share this plan with friends: they follow it with a code and send cheers. */
export function PlanExtras({ plan }: { plan: Plan }) {
  const { t } = useT();
  const updatePlan = useApp((s) => s.updatePlan);
  const peopleOff = useApp((s) => s.consent.under13 && !s.parental.peopleEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  if (peopleOff) return null;

  async function share() {
    setBusy(true);
    setError(false);
    try {
      const r = await apiPost<{ code: string }>("/api/people/shared-plan", {
        action: "share",
        plan: { goal: plan.goal.slice(0, 200), summary: plan.summary?.slice(0, 600), milestones: plan.milestones.slice(0, 40).map((m) => ({ title: m.title.slice(0, 300), horizon: m.horizon, detail: m.detail?.slice(0, 300) })) },
      });
      updatePlan(plan.id, { sharedCode: r.code });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-4 space-y-2">
      <h2 className="flex items-center gap-2 font-bold">
        <Share2 aria-hidden="true" className="size-5 text-primary" />
        {t("people.shareTitle")}
      </h2>
      <p className="text-sm text-muted">{t("people.shareHelp")}</p>
      {plan.sharedCode ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold" role="status">
            {t("people.shareCode", { code: plan.sharedCode })}
          </p>
          <Button variant="ghost" size="sm" icon={<Copy aria-hidden="true" className="size-4" />} onClick={() => navigator.clipboard?.writeText(plan.sharedCode!).catch(() => {})}>
            {t("people.shareCopy")}
          </Button>
          <Link href={`/people/plan?code=${plan.sharedCode}`} className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4">
            {t("people.shareOpen")}
          </Link>
        </div>
      ) : (
        <Button variant="soft" onClick={share} disabled={busy}>
          {t("people.shareButton")}
        </Button>
      )}
      {error && <Alert tone="danger">{t("people.error")}</Alert>}
    </Card>
  );
}
