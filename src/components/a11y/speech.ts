"use client";

// Helpers for the browser's built-in speech features (free, no API cost).

/** Read text out loud in the chosen language. */
export function speak(text: string, lang: string, rate = 1, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  // Long text is split into sentences; some browsers stop reading after ~15 seconds otherwise.
  const chunks = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  chunks.forEach((chunk, i) => {
    const u = new SpeechSynthesisUtterance(chunk.trim());
    u.lang = lang;
    u.rate = rate;
    if (voice) u.voice = voice;
    if (i === chunks.length - 1 && onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  });
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Minimal types for the Web Speech API (not in TypeScript's standard library yet). */
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; resultIndex: number }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}
