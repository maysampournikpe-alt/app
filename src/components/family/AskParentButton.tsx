"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { Opportunity } from "@/types";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { createParentLink, toShareItem } from "@/lib/family-client";
import { ShareLinkSheet } from "./ShareLinkSheet";

/** 2.1.2 Parent approval: send one opportunity to a parent for a yes or no. */
export function AskParentButton({ opp }: { opp: Opportunity }) {
  const { t } = useT();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(false);
          try {
            const app = useApp.getState();
            if (!app.saved.some((s) => s.id === opp.id)) app.saveOpportunity(opp);
            const link = await createParentLink("approval", [toShareItem(opp)]);
            app.updateSaved(opp.id, { parentShareToken: link.split("/").pop(), parentDecision: "pending" });
            setUrl(link);
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-border px-4 font-bold hover:border-primary disabled:opacity-60"
      >
        <Users aria-hidden="true" className="size-4" />
        {busy ? t("family.creating") : t("family.askParent")}
      </button>
      {error && <span role="alert" className="text-sm text-danger">{t("common.error")}</span>}
      <ShareLinkSheet url={url} message={t("family.shareMessage")} onClose={() => setUrl(null)} />
    </>
  );
}
