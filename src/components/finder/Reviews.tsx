"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Star, Flag } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { apiGet, apiPost } from "@/lib/api";
import { shortHash, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Alert } from "@/components/ui/misc";

interface Review {
  id: string;
  nickname: string;
  rating: number;
  tip: string;
}

export const reviewKey = (o: Opportunity) => shortHash(`${o.sourceUrl ?? o.id}|${o.title.toLowerCase()}`);

/** 3.1.9 Student reviews: rate an opportunity and leave a short tip (filtered and reportable). */
export function Reviews({ opp }: { opp: Opportunity }) {
  const { t } = useT();
  const nickname = useApp((s) => s.profile.nickname);
  const [data, setData] = useState<{ avg: number | null; reviews: Review[] } | null>(null);
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState("");
  const [nick, setNick] = useState(nickname ?? "");
  const [msg, setMsg] = useState<{ tone: "success" | "danger" | "info"; text: string } | null>(null);
  const key = reviewKey(opp);

  const load = () =>
    apiGet<{ avg: number | null; reviews: Review[] }>(`/api/reviews?key=${key}`)
      .then(setData)
      .catch(() => setData({ avg: null, reviews: [] }));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const r = await apiPost<{ removed: string[] }>("/api/reviews", { action: "post", key, rating, tip, nickname: nick });
      setMsg({ tone: r.removed.length ? "info" : "success", text: r.removed.length ? t("explore.reviewRemoved") : t("explore.reviewPosted") });
      setWriting(false);
      setTip("");
      void load();
    } catch {
      setMsg({ tone: "danger", text: t("explore.reviewBlocked") });
    }
  }

  return (
    <section aria-labelledby={`rev-${key}`}>
      <h3 id={`rev-${key}`} className="font-bold">
        {t("explore.reviewsTitle")}
        {data?.avg != null && <span className="ml-2 text-sm font-normal text-muted">★ {t("explore.avgRating", { avg: data.avg.toFixed(1), count: data.reviews.length })}</span>}
      </h3>
      {data && data.reviews.length === 0 && !writing && <p className="text-sm text-muted">{t("explore.reviewsNone")}</p>}
      <ul className="mt-2 space-y-2">
        {data?.reviews.map((r) => (
          <li key={r.id} className="rounded-xl bg-surface-2 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">
                {r.nickname} <span aria-label={t("explore.reviewStars", { count: r.rating })}>{"★".repeat(r.rating)}</span>
              </span>
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-1 text-xs text-muted hover:text-danger"
                onClick={async () => {
                  await apiPost("/api/reviews", { action: "report", id: r.id }).catch(() => {});
                  setMsg({ tone: "info", text: t("explore.reported") });
                }}
              >
                <Flag aria-hidden="true" className="size-3.5" />
                {t("explore.report")}
              </button>
            </div>
            <p className="mt-1">{r.tip}</p>
          </li>
        ))}
      </ul>
      {msg && (
        <Alert tone={msg.tone} role="status" className="mt-2">
          {msg.text}
        </Alert>
      )}
      {writing ? (
        <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-border p-3">
          <fieldset>
            <legend className="mb-1 font-bold">{t("explore.reviewRating")}</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-pressed={rating >= n} aria-label={t("explore.reviewStars", { count: n })} onClick={() => setRating(n)} className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-surface-2">
                  <Star aria-hidden="true" className={cn("size-6", rating >= n ? "fill-amber-400 text-amber-500" : "text-muted")} />
                </button>
              ))}
            </div>
          </fieldset>
          <Field label={t("explore.reviewTip")}>{(id) => <Textarea id={id} value={tip} maxLength={400} onChange={(e) => setTip(e.target.value)} placeholder={t("explore.reviewTipPlaceholder")} className="min-h-16" required minLength={3} />}</Field>
          <Field label={t("explore.reviewNickname")}>{(id) => <Input id={id} value={nick} maxLength={24} onChange={(e) => setNick(e.target.value)} />}</Field>
          <Button type="submit" size="sm">
            {t("explore.reviewPost")}
          </Button>
        </form>
      ) : (
        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setWriting(true)}>
          {t("explore.reviewAdd")}
        </Button>
      )}
    </section>
  );
}
