"use client";

import { useState } from "react";
import { Copy, Check, Share2, MessageSquare } from "lucide-react";
import { useT } from "@/i18n/useT";
import { Sheet } from "@/components/ui/Sheet";
import { Alert } from "@/components/ui/misc";

/** Shows a private link with Copy / Share / Text buttons. */
export function ShareLinkSheet({ url, message, onClose }: { url: string | null; message: string; onClose: () => void }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  return (
    <Sheet open={!!url} onClose={onClose} title={t("family.linkReady")} closeLabel={t("common.close")}>
      {url && (
        <div className="space-y-3">
          <p className="text-sm text-muted">{t("family.linkHelp")}</p>
          <p className="break-all rounded-xl bg-surface-2 p-3 font-mono text-sm">{url}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${message} ${url}`);
                  setCopied(true);
                } catch {
                  /* blocked */
                }
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-on-primary"
            >
              {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
              <span aria-live="polite">{copied ? t("common.copied") : t("family.copyLink")}</span>
            </button>
            {canShare && (
              <button
                type="button"
                onClick={() => void navigator.share({ title: "Rumbo", text: message, url }).catch(() => {})}
                className="inline-flex min-h-11 items-center gap-2 press rounded-2xl border-2 border-b-4 border-border bg-surface px-4 font-display text-sm font-extrabold hover:bg-surface-2 active:border-b-2"
              >
                <Share2 aria-hidden="true" className="size-4" />
                {t("family.shareLink")}
              </button>
            )}
            <a href={`sms:?&body=${encodeURIComponent(`${message} ${url}`)}`} className="inline-flex min-h-11 items-center gap-2 press rounded-2xl border-2 border-b-4 border-border bg-surface px-4 font-display text-sm font-extrabold hover:bg-surface-2 active:border-b-2">
              <MessageSquare aria-hidden="true" className="size-4" />
              {t("family.textLink")}
            </a>
          </div>
          <Alert tone="info">{t("family.aboutApp")}</Alert>
        </div>
      )}
    </Sheet>
  );
}
