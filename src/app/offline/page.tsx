"use client";

import { WifiOff } from "lucide-react";
import { useT } from "@/i18n/useT";
import { ButtonLink } from "@/components/ui/Button";

/** Shown by the service worker when a page isn't saved for offline use. */
export default function OfflinePage() {
  const { t } = useT();
  return (
    <div className="py-10 text-center">
      <WifiOff aria-hidden="true" className="mx-auto mb-4 size-14 text-muted" />
      <h1 className="text-2xl font-bold">{t("offline.title")}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">{t("offline.body")}</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <ButtonLink href="/me/saved">{t("offline.saved")}</ButtonLink>
        <ButtonLink href="/plan" variant="secondary">
          {t("offline.plans")}
        </ButtonLink>
      </div>
    </div>
  );
}
