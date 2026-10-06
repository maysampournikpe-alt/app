"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Upload, Trash2 } from "lucide-react";
import { useT } from "@/i18n/useT";
import { apiPost } from "@/lib/api";
import { useApp, STORE_KEY, type AppState } from "@/lib/store";
import { downloadFile, todayISO } from "@/lib/utils";
import { PageHeader, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** 10.6 Students control their own data: download, restore, or delete everything. */
export default function DataPage() {
  const { t } = useT();
  const router = useRouter();
  const [msg, setMsg] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  function download() {
    const raw = localStorage.getItem(STORE_KEY) ?? "{}";
    downloadFile(`rumbo-my-data-${todayISO()}.json`, JSON.stringify(JSON.parse(raw), null, 2), "application/json");
  }

  async function restore(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      const state = (parsed.state ?? parsed) as Partial<AppState>;
      if (!state || typeof state !== "object" || !("profile" in state) || !("settings" in state)) throw new Error("not rumbo");
      // Only copy known data fields (never functions or unknown keys).
      const allowed = Object.keys(useApp.getState()).filter((k) => typeof (useApp.getState() as unknown as Record<string, unknown>)[k] !== "function");
      const clean = Object.fromEntries(Object.entries(state).filter(([k]) => allowed.includes(k)));
      useApp.getState().importData(clean as Partial<AppState>);
      setMsg({ tone: "success", text: t("me.imported") });
    } catch {
      setMsg({ tone: "danger", text: t("me.importError") });
    }
  }

  async function wipe() {
    if (!window.confirm(t("me.deleteConfirm"))) return;
    const app = useApp.getState();
    // First remove what this device shared with the server (posts, reviews, shared plans, parent links...).
    try {
      await apiPost("/api/me/forget", {
        parentTokens: app.saved.map((s) => s.parentShareToken).filter(Boolean),
        sharedPlanCodes: app.plans.map((p) => p.sharedCode).filter(Boolean),
      });
    } catch {
      if (!window.confirm(t("me.deleteOffline"))) return;
    }
    useApp.getState().resetAll();
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    if ("caches" in window) void caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    router.replace("/welcome");
  }

  return (
    <div>
      <Link href="/me" className="mb-3 inline-flex min-h-10 items-center gap-1 font-bold text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t("me.title")}
      </Link>
      <PageHeader title={t("me.dataTitle")} subtitle={t("me.dataIntro")} />
      <div className="space-y-4">
        <Card>
          <h2 className="font-bold">{t("me.download")}</h2>
          <p className="mt-1 text-sm text-muted">{t("me.downloadHelp")}</p>
          <Button className="mt-3" onClick={download} icon={<Download aria-hidden="true" className="size-4" />}>
            {t("me.download")}
          </Button>
        </Card>
        <Card>
          <h2 className="font-bold">{t("me.importLabel")}</h2>
          <p className="mt-1 text-sm text-muted">{t("me.importHelp")}</p>
          <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-border px-4 font-bold focus-within:outline focus-within:outline-3 focus-within:outline-focus">
            <Upload aria-hidden="true" className="size-4" />
            {t("me.importLabel")}
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => e.target.files?.[0] && void restore(e.target.files[0])} />
          </label>
        </Card>
        {msg && (
          <Alert tone={msg.tone} role="status">
            {msg.text}
          </Alert>
        )}
        <Card className="border-danger/40">
          <h2 className="font-bold text-danger">{t("me.delete")}</h2>
          <p className="mt-1 text-sm text-muted">{t("me.deleteHelp")}</p>
          <Button variant="danger" className="mt-3" onClick={() => void wipe()} icon={<Trash2 aria-hidden="true" className="size-4" />}>
            {t("me.delete")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
