"use client";

import { useState } from "react";
import { Plus, Trash2, RotateCcw, Check } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { PACKING_TEMPLATES } from "@/data/packing";
import { cn } from "@/lib/utils";
import { PageHeader, SectionTitle, ProgressBar, EmptyState } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/explore/common";

/** 5.3 Packing lists for tournaments, camps, and trips (work offline). */
export default function PackingPage() {
  const { t, L } = useT();
  const lists = useApp((s) => s.packing);
  const addPacking = useApp((s) => s.addPacking);
  const updatePacking = useApp((s) => s.updatePacking);
  const removePacking = useApp((s) => s.removePacking);
  const [openId, setOpenId] = useState<string | null>(lists[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const open = lists.find((l) => l.id === openId);

  return (
    <div>
      <BackLink href="/plan" label={t("plan.title")} />
      <PageHeader title={t("life.packingTitle")} subtitle={t("life.packingSub")} />
      <SectionTitle>{t("life.packingFromTemplate")}</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {PACKING_TEMPLATES.map((tpl) => (
          <Button key={tpl.id} variant="secondary" size="sm" onClick={() => setOpenId(addPacking({ title: t(`life.tpl_${tpl.id}`), items: tpl.items.map((i) => ({ text: L(i), done: false })) }))}>
            <span aria-hidden="true">{tpl.emoji}</span> {t(`life.tpl_${tpl.id}`)}
          </Button>
        ))}
        <Button variant="ghost" size="sm" icon={<Plus aria-hidden="true" className="size-4" />} onClick={() => setOpenId(addPacking({ title: t("life.packingBlank"), items: [] }))}>
          {t("life.packingBlank")}
        </Button>
      </div>

      {open && (
        <Card className="mt-5">
          <label htmlFor="pk-name" className="sr-only">
            {t("life.packingName")}
          </label>
          <input id="pk-name" value={open.title} maxLength={60} onChange={(e) => updatePacking(open.id, { title: e.target.value })} className="w-full rounded-lg bg-transparent text-lg font-bold focus:outline-none" />
          <p className="mt-1 text-sm text-muted">{t("life.packingDone", { a: open.items.filter((i) => i.done).length, b: open.items.length })}</p>
          <ProgressBar value={open.items.length ? open.items.filter((i) => i.done).length / open.items.length : 0} label={open.title} className="mt-1" tone="success" />
          <ul className="mt-3 space-y-1">
            {open.items.map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={it.done}
                  onClick={() => updatePacking(open.id, { items: open.items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}
                  className="flex min-h-11 flex-1 items-center gap-3 rounded-xl px-2 text-left hover:bg-surface-2"
                >
                  <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-md border-2", it.done ? "border-success bg-success text-white dark:text-black" : "border-border")}>
                    {it.done && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className={cn(it.done && "text-muted line-through")}>{it.text}</span>
                </button>
                <button type="button" aria-label={`${t("common.remove")}: ${it.text}`} onClick={() => updatePacking(open.id, { items: open.items.filter((_, j) => j !== i) })} className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-surface-2">
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              updatePacking(open.id, { items: [...open.items, { text: draft.trim().slice(0, 80), done: false }] });
              setDraft("");
            }}
          >
            <label htmlFor="pk-add" className="sr-only">
              {t("life.packingAddItem")}
            </label>
            <Input id="pk-add" value={draft} placeholder={t("life.packingAddItem")} onChange={(e) => setDraft(e.target.value)} maxLength={80} />
            <Button type="submit" variant="soft" aria-label={t("life.packingAddItem")}>
              <Plus aria-hidden="true" className="size-4" />
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={() => updatePacking(open.id, { items: open.items.map((x) => ({ ...x, done: false })) })}>
              {t("life.packingReset")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              icon={<Trash2 aria-hidden="true" className="size-4" />}
              onClick={() => {
                removePacking(open.id);
                setOpenId(null);
              }}
            >
              {t("life.packingDelete")}
            </Button>
          </div>
        </Card>
      )}

      <SectionTitle>{t("life.packingMy")}</SectionTitle>
      {lists.length === 0 ? (
        <EmptyState icon="🎒" title={t("life.packingNone")} />
      ) : (
        <ul className="space-y-2">
          {lists.map((l) => (
            <li key={l.id}>
              <button type="button" aria-pressed={l.id === openId} onClick={() => setOpenId(l.id)} className={cn("flex w-full items-center justify-between rounded-2xl border-2 border-b-4 border-border bg-surface p-3 text-left", l.id === openId ? "border-primary" : "border-border")}>
                <span className="font-bold">{l.title}</span>
                <span className="text-sm text-muted">{t("life.packingDone", { a: l.items.filter((i) => i.done).length, b: l.items.length })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
