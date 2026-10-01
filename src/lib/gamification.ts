// Levels, XP, badges, and monthly challenges (Phase 9: Motivation and fun).
// Badges are calculated from what the student has done, so they can never get out of sync.

export const XP_RULES = {
  save: 5,
  apply: 25,
  attend: 30,
  accepted: 75,
  plan_created: 10,
  plan_step: 10,
  plan_complete: 60,
  accomplishment: 15,
  volunteer: 10,
  certificate: 40,
  daily_visit: 2,
  daily_challenge: 10,
  practice_test: 15,
  flashcards: 5,
  coach: 2,
} as const;
export type XpReason = keyof typeof XP_RULES;

/** XP needed to reach each level. Level 1 starts at 0. */
export function levelFromXp(xp: number) {
  // Each level needs a bit more XP than the last: 50, 120, 210, 320, ...
  let level = 1;
  let needed = 50;
  let floor = 0;
  while (xp >= floor + needed) {
    floor += needed;
    level += 1;
    needed += 20;
  }
  return { level, into: xp - floor, needed, progress: (xp - floor) / needed };
}

export interface BadgeStats {
  saved: number;
  applied: number;
  accepted: number;
  attended: number;
  plans: number;
  planSteps: number;
  plansDone: number;
  hours: number;
  accomplishments: number;
  certificates: number;
  streakBest: number;
  dailyDone: number;
  practiceTests: number;
  decks: number;
  coachChats: number;
  languages: number;
}

export interface BadgeDef {
  id: string;
  icon: string; // emoji
  test: (s: BadgeStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: "explorer", icon: "🧭", test: (s) => s.saved >= 1 },
  { id: "collector", icon: "📌", test: (s) => s.saved >= 10 },
  { id: "go_getter", icon: "🚀", test: (s) => s.applied >= 1 },
  { id: "applier", icon: "📝", test: (s) => s.applied >= 5 },
  { id: "accepted", icon: "🎉", test: (s) => s.accepted >= 1 },
  { id: "showed_up", icon: "🙌", test: (s) => s.attended >= 1 },
  { id: "planner", icon: "🗺️", test: (s) => s.plans >= 1 },
  { id: "step_by_step", icon: "🪜", test: (s) => s.planSteps >= 10 },
  { id: "finisher", icon: "🏁", test: (s) => s.plansDone >= 1 },
  { id: "helper", icon: "🤝", test: (s) => s.hours >= 1 },
  { id: "volunteer_10", icon: "💚", test: (s) => s.hours >= 10 },
  { id: "volunteer_50", icon: "🌟", test: (s) => s.hours >= 50 },
  { id: "achiever", icon: "🏅", test: (s) => s.accomplishments >= 3 },
  { id: "certified", icon: "📜", test: (s) => s.certificates >= 1 },
  { id: "streak_3", icon: "🔥", test: (s) => s.streakBest >= 3 },
  { id: "streak_7", icon: "⚡", test: (s) => s.streakBest >= 7 },
  { id: "daily_5", icon: "🧩", test: (s) => s.dailyDone >= 5 },
  { id: "test_taker", icon: "✏️", test: (s) => s.practiceTests >= 1 },
  { id: "flashcards", icon: "🃏", test: (s) => s.decks >= 1 },
  { id: "coached", icon: "💬", test: (s) => s.coachChats >= 1 },
];

/** Avatar items unlocked by level. */
export const AVATAR_UNLOCKS = {
  colors: [
    { id: "teal", level: 1, value: "#0b6b66" },
    { id: "orange", level: 1, value: "#c2410c" },
    { id: "purple", level: 2, value: "#6d28d9" },
    { id: "blue", level: 3, value: "#1d4ed8" },
    { id: "pink", level: 4, value: "#be185d" },
    { id: "gold", level: 6, value: "#a16207" },
  ],
  faces: [
    { id: "smile", level: 1, value: "😊" },
    { id: "cool", level: 2, value: "😎" },
    { id: "star", level: 3, value: "🤩" },
    { id: "nerd", level: 4, value: "🤓" },
    { id: "robot", level: 5, value: "🤖" },
    { id: "owl", level: 7, value: "🦉" },
  ],
  hats: [
    { id: "none", level: 1, value: "" },
    { id: "cap", level: 2, value: "🧢" },
    { id: "grad", level: 4, value: "🎓" },
    { id: "crown", level: 8, value: "👑" },
  ],
  frames: [
    { id: "none", level: 1, value: "none" },
    { id: "ring", level: 3, value: "ring" },
    { id: "glow", level: 5, value: "glow" },
    { id: "sunset", level: 7, value: "sunset" },
  ],
} as const;

/** Monthly challenge: one per month, rotates through this list. */
export const MONTHLY_CHALLENGES = [
  { id: "volunteer5", kind: "hours", target: 5 },
  { id: "apply3", kind: "applied", target: 3 },
  { id: "steps8", kind: "planSteps", target: 8 },
  { id: "daily10", kind: "daily", target: 10 },
  { id: "save5", kind: "saved", target: 5 },
  { id: "practice3", kind: "practice", target: 3 },
] as const;
