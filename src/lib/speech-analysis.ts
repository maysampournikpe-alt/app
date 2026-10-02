// Public speaking analysis (Phase 4.5): pace and filler words, in English and Spanish.

const FILLERS = ["um", "uh", "uhm", "er", "ah", "like", "you know", "basically", "literally", "so yeah", "kind of", "sort of", "este", "eh", "o sea", "pues", "bueno", "como que", "verdad", "tipo"];

export interface SpeechStats {
  words: number;
  seconds: number;
  wpm: number;
  fillers: { word: string; count: number }[];
  fillerTotal: number;
  pace: "slow" | "good" | "fast" | "unknown";
}

export function analyzeSpeech(transcript: string, seconds: number): SpeechStats {
  const clean = ` ${transcript.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ")} `;
  const words = clean.trim() ? clean.trim().split(" ").length : 0;
  const fillers = FILLERS.map((f) => ({ word: f, count: clean.split(` ${f} `).length - 1 })).filter((f) => f.count > 0).sort((a, b) => b.count - a.count);
  const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
  const pace = seconds < 10 || words < 10 ? "unknown" : wpm < 110 ? "slow" : wpm > 170 ? "fast" : "good";
  return { words, seconds, wpm, fillers, fillerTotal: fillers.reduce((n, f) => n + f.count, 0), pace };
}
