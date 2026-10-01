"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useT } from "@/i18n/useT";

/** Shows a small banner when the phone loses internet. */
export function OfflineBanner() {
  const { t } = useT();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" className="no-print flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-sm font-bold text-warning">
      <WifiOff aria-hidden="true" className="size-4" />
      {t("common.offlineNow")}
    </div>
  );
}
