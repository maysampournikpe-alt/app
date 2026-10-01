import type { CoachMode } from "@/types";

/** The Coach modes, in the order shown. */
export const COACH_MODES: { id: CoachMode; emoji: string }[] = [
  { id: "ask", emoji: "💬" },
  { id: "homework", emoji: "📐" },
  { id: "interview", emoji: "🎤" },
  { id: "debate", emoji: "⚖️" },
  { id: "quiz", emoji: "❓" },
  { id: "email", emoji: "✉️" },
  { id: "essay", emoji: "📝" },
  { id: "language", emoji: "🗣️" },
];
