"use client";

import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking } from "./speech";

/** "Read aloud" button for results, plans, and coach answers (Phase 10.2). */
export function ReadAloudButton({ text, className, compact }: { text: string; className?: string; compact?: boolean }) {
  const { t, speechLang } = useT();
  const rate = useApp((s) => s.settings.readAloudRate);
  const [speaking, setSpeaking] = useState(false);
  // Pages only render in the browser (after the student's data loads), so this is safe.
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => () => stopSpeaking(), []);

  if (!supported) return null;
  const label = speaking ? t("common.stopReading") : t("common.readAloud");
  return (
    <button
      type="button"
      onClick={() => {
        if (speaking) {
          stopSpeaking();
          setSpeaking(false);
        } else {
          setSpeaking(true);
          speak(text, speechLang, rate, () => setSpeaking(false));
        }
      }}
      aria-label={compact ? label : undefined}
      title={label}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-sm font-semibold shadow-xs transition-colors hover:bg-surface-2",
        compact && "size-9 justify-center px-0",
        className,
      )}
    >
      {speaking ? <Square aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
      {!compact && label}
    </button>
  );
}
