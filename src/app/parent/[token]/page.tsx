"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, CheckCircle2, XCircle, ShieldCheck, Printer } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import type { ShareItem } from "@/lib/family-client";
import { formatDate } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/categories";
import type { Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { Alert, Spinner } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

interface ShareData {
  kind: "summary" | "approval";
  locale: string;
  items: ShareItem[];
  decision?: "approved" | "declined" | null;
  parentNote?: string | null;
}

/** 2.1.1 / 2.1.2 Parent view: a simple bilingual summary, and Yes/No for approval links. No login needed. */
export default function ParentPage() {
  const { token } = useParams<{ token: string }>();
  const { t, dateLocale } = useT();
  const onboarded = useApp((s) => s.consent.onboarded);
  const setSettings = useApp((s) => s.setSettings);
  const [data, setData] = useState<ShareData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/parent/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ShareData) => {
        if (!alive) return;
        setData(d);
        setState("ready");
        // On a parent's phone (not set up as a student), start in the student's language.
        if (!onboarded && d.locale) setSettings({ locale: d.locale });
      })
      .catch(() => alive && setState("missing"));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function decide(decision: "approved" | "declined") {
    setSending(true);
    const r = await fetch(`/api/parent/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, note: note.trim() || undefined }) });
    setSending(false);
    if (r.ok) {
      setSent(true);
      setData((d) => (d ? { ...d, decision, parentNote: note } : d));
    }
  }

  if (state === "loading") return <Spinner label={t("common.loading")} />;
  if (state === "missing" || !data) return <Alert tone="warning">{t("family.notFound")}</Alert>;

  const nl = t("family.notListed");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{data.kind === "approval" ? t("family.approvalTitle") : t("family.summaryTitle")}</h1>
        <p className="mt-1 text-muted">{data.kind === "approval" ? t("family.approvalIntro") : t("family.pageIntro")}</p>
      </div>

      <ul className="space-y-3">
        {data.items.map((it, i) => (
          <li key={i}>
            <Card className="print-plain">
              <p className="text-sm font-bold text-primary">
                {CATEGORY_EMOJI[it.category as Category] ?? "📌"} {t(`cat.${it.category}`)}
              </p>
              <h2 className="text-lg font-bold">{it.title}</h2>
              {it.organization && <p className="text-sm text-muted">{it.organization}</p>}
              <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="font-bold">{t("family.deadline")}</dt>
                <dd>{it.deadline ? formatDate(it.deadline, dateLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : nl}</dd>
                <dt className="font-bold">{t("family.when")}</dt>
                <dd>{it.dateText ?? nl}</dd>
                <dt className="font-bold">{t("family.cost")}</dt>
                <dd>{it.free ? `${t("family.free")}${it.costText ? ` — ${it.costText}` : ""}` : (it.costText ?? nl)}</dd>
                <dt className="font-bold">{t("family.where")}</dt>
                <dd>{it.where === "online" ? t("family.online") : (it.where ?? nl)}</dd>
                {it.status && (
                  <>
                    <dt className="font-bold">{t("family.status")}</dt>
                    <dd>{t(`opp.status${it.status.charAt(0).toUpperCase()}${it.status.slice(1)}`)}</dd>
                  </>
                )}
              </dl>
              {it.sourceUrl && (
                <a href={it.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 font-bold text-primary underline underline-offset-4">
                  {t("family.officialPage")}
                  <ExternalLink aria-hidden="true" className="size-4" />
                  <span className="sr-only">{t("common.externalLink")}</span>
                </a>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {data.kind === "approval" && (
        <Card className="space-y-3">
          {data.decision ? (
            <Alert tone={data.decision === "approved" ? "success" : "warning"} role="status">
              {sent && <p className="font-bold">{t("family.sent")}</p>}
              {t("family.alreadyAnswered", { answer: data.decision === "approved" ? t("family.approvedWord") : t("family.declinedWord") })}
            </Alert>
          ) : (
            <>
              <label htmlFor="pnote" className="block font-bold">
                {t("family.noteLabel")}
              </label>
              <Textarea id="pnote" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} className="min-h-16" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button full size="lg" disabled={sending} onClick={() => decide("approved")} icon={<CheckCircle2 aria-hidden="true" className="size-5" />}>
                  {t("family.yes")}
                </Button>
                <Button full size="lg" variant="secondary" disabled={sending} onClick={() => decide("declined")} icon={<XCircle aria-hidden="true" className="size-5" />}>
                  {t("family.no")}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      <Card>
        <h2 className="flex items-center gap-2 font-bold">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          {t("family.safetyTips")}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>{t("family.tip1")}</li>
          <li>{t("family.tip2")}</li>
          <li>{t("family.tip3")}</li>
        </ul>
        <p className="mt-3 text-xs text-muted">{t("family.aboutApp")}</p>
      </Card>
      <Button variant="ghost" className="no-print" onClick={() => window.print()} icon={<Printer aria-hidden="true" className="size-4" />}>
        {t("common.print")}
      </Button>
    </div>
  );
}
