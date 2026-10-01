"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { createParentLink, toShareItem } from "@/lib/family-client";
import { Button } from "@/components/ui/Button";
import { ShareLinkSheet } from "./ShareLinkSheet";

/** 2.1.1 Send a parent a simple summary of everything saved (dates, costs, places). */
export function ShareListButton() {
  const { t } = useT();
  const saved = useApp((s) => s.saved);
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!saved.length) return null;
  return (
    <div className="mb-4 rounded-2xl bg-surface p-4 shadow-sm">
      <Button
        variant="soft"
        disabled={busy}
        icon={<Users aria-hidden="true" className="size-4" />}
        onClick={async () => {
          setBusy(true);
          try {
            setUrl(await createParentLink("summary", saved.slice(0, 40).map((s) => toShareItem(s.opp, s.status))));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? t("family.creating") : t("family.shareSummary")}
      </Button>
      <p className="mt-2 text-sm text-muted">{t("family.shareSummaryHelp")}</p>
      <ShareLinkSheet url={url} message={t("family.shareMessageSummary")} onClose={() => setUrl(null)} />
    </div>
  );
}
