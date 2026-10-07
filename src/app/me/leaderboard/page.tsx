"use client";

import { useEffect, useState } from "react";
import { School } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet } from "@/lib/api";
import { PageHeader, Segmented, Spinner, Alert } from "@/components/ui/misc";
import { Badge } from "@/components/ui/Badge";
import { BackLink } from "@/components/explore/common";
import { cn } from "@/lib/utils";

interface Row {
  name: string;
  city: string | null;
  hours: number;
  yours: boolean;
  demo: boolean;
}

/** 9.4 School leaderboard for volunteer hours — school totals only, never individual students. */
export default function LeaderboardPage() {
  const { t } = useT();
  const code = useApp((s) => s.profile.schoolCode);
  const [period, setPeriod] = useState<"month" | "all">("month");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setRows(null);
    apiGet<{ schools: Row[] }>(`/api/school/leaderboard?period=${period}${code ? `&code=${encodeURIComponent(code)}` : ""}`)
      .then((r) => alive && setRows(r.schools))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [period, code]);

  const max = Math.max(1, ...(rows ?? []).map((r) => r.hours));
  return (
    <div>
      <BackLink href="/me/progress" label={t("progress.title")} />
      <PageHeader title={t("fun.leaderTitle")} subtitle={t("fun.leaderSub")} />
      <div className="mb-4">
        <Segmented<"month" | "all"> label={t("fun.leaderTitle")} value={period} onChange={setPeriod} options={[{ value: "month", label: t("fun.leaderMonth") }, { value: "all", label: t("fun.leaderAll") }]} />
      </div>
      {failed && <Alert tone="warning">{t("people.error")}</Alert>}
      {!rows && !failed && <Spinner label={t("common.loading")} />}
      {rows && rows.length === 0 && <p className="text-muted">{t("fun.leaderEmpty")}</p>}
      {rows && rows.length > 0 && (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.name} className={cn("rounded-xl border p-3", r.yours ? "border-primary bg-primary-soft" : "border-border bg-surface")}>
              <div className="flex items-center gap-3">
                <span className="w-8 text-center text-xl font-bold" aria-hidden="true">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <School aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="sr-only">#{i + 1} </span>
                  <span className="block font-bold">{r.name}</span>
                  {r.city && <span className="block text-sm text-muted">{r.city}</span>}
                </span>
                {r.yours && <Badge tone="primary">{t("fun.leaderYours")}</Badge>}
                <span className="font-bold whitespace-nowrap">{t("fun.leaderHours", { n: r.hours })}</span>
              </div>
              <span aria-hidden="true" className="mt-2 block h-2 rounded-full bg-success" style={{ width: `${(r.hours / max) * 100}%` }} />
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-sm text-muted">{t("fun.leaderHow")}</p>
      {rows?.some((r) => r.demo) && <p className="mt-1 text-sm text-muted">{t("fun.leaderDemo")}</p>}
    </div>
  );
}
