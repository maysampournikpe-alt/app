"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { SavedItem } from "@/types";
import { useT } from "@/i18n/useT";
import { refreshParentDecision } from "@/lib/family-client";
import { AskParentButton } from "@/components/family/AskParentButton";

/** Parent approval status for a saved item (2.1.2). */
export function SavedItemExtras({ item }: { item: SavedItem }) {
  const { t } = useT();
  const [checking, setChecking] = useState(false);
  const pendingWithLink = item.parentDecision === "pending" && item.parentShareToken;

  // Check once when the page opens.
  useEffect(() => {
    if (pendingWithLink) void refreshParentDecision(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (item.parentDecision !== "pending") return null;
  // Keep the "Ask a parent" button mounted so its share panel stays open after the link is made.
  return (
    <div className="flex flex-wrap items-center gap-3 px-1">
      <AskParentButton opp={item.opp} />
      {pendingWithLink && (
        <button
          type="button"
          disabled={checking}
          onClick={async () => {
            setChecking(true);
            await refreshParentDecision(item);
            setChecking(false);
          }}
          className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4"
        >
          <RefreshCw aria-hidden="true" className={checking ? "size-4 animate-spin" : "size-4"} />
          {t("family.checkAnswer")}
        </button>
      )}
    </div>
  );
}
