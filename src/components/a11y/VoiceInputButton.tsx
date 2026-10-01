"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { getSpeechRecognition, type SpeechRecognitionLike } from "./speech";

/** Microphone button: speak instead of typing (Phase 10.1). Hidden if the browser can't do it. */
export function VoiceInputButton({ onText, className }: { onText: (text: string, final: boolean) => void; className?: string }) {
  const { t, speechLang } = useT();
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Pages only render in the browser (after the student's data loads), so this is safe.
  const supported = !!getSpeechRecognition();

  useEffect(() => () => recRef.current?.abort(), []);

  if (!supported) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;
    const rec = new SR();
    rec.lang = speechLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      onText(text, final);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  const label = listening ? t("common.listening") : t("common.voiceInput");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={listening}
      title={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
        listening ? "animate-pulse bg-accent text-white dark:text-black" : "bg-surface-2 text-text hover:bg-primary-soft",
        className,
      )}
    >
      {listening ? <MicOff aria-hidden="true" className="size-5" /> : <Mic aria-hidden="true" className="size-5" />}
    </button>
  );
}
