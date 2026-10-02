// Shared data shapes used by both the browser and the server.

export const CATEGORIES = [
  "job",
  "internship",
  "academic_competition",
  "sports_competition",
  "event",
  "volunteer",
  "club",
  "scholarship",
  "summer_program",
  "camp",
  "course",
  "certification",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type CostType = "free" | "paid" | "unknown";
export type Mode = "online" | "in_person" | "hybrid" | "unknown";
export type YesNoUnknown = "yes" | "no" | "unknown";

/** One opportunity card. Unknown details are left undefined and shown as "Not listed". */
export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  category: Category;
  cost: { type: CostType; text?: string; feeWaiver?: string };
  /** true = the student gets paid (job, paid internship) */
  paid?: boolean;
  payText?: string;
  grades?: { min?: number; max?: number };
  ages?: { min?: number; max?: number };
  eligibility?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  deadline?: string;
  dateText?: string; // e.g. "Saturdays in November"
  mode: Mode;
  city?: string;
  address?: string; // organization's public address only
  lat?: number;
  lng?: number;
  distanceMiles?: number;
  carFree: YesNoUnknown;
  transitNote?: string;
  sourceUrl?: string;
  /** web = found by AI web search, demo = sample data, staff = posted by verified school staff */
  source: "web" | "demo" | "staff";
  verified?: boolean;
  staffName?: string;
  whyFits?: string;
  /** Warning signs found by the AI or by our rule-based scam check */
  scamWarnings?: string[];
  tags?: string[];
  foundAt?: string;
}

/** "Not a confirmed listing" — a place that MIGHT offer what the student wants. */
export interface Suggestion {
  id: string;
  name: string;
  kind: string; // e.g. "Legal aid office"
  why: string;
  city?: string;
  website?: string;
  howToFind?: string;
  emailScript: string;
  phoneScript: string;
}

export interface FinderResponse {
  results: Opportunity[];
  suggestions: Suggestion[];
  /** short friendly message from the AI */
  message?: string;
  demo: boolean;
  cached?: boolean;
  /** listings removed because their link was not a real search result */
  removedCount?: number;
  /** "limit" when the daily limit was reached */
  notice?: "limit" | "budget" | "error" | "demo";
  areaLabel?: string;
  /** Approximate center of the search area (for the map). */
  center?: { lat: number; lng: number };
}

export interface LocationInput {
  zip?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

/** What the server is allowed to know about the student (no names). */
export interface ProfileSummary {
  grade?: number;
  age?: number;
  interests?: string[];
  skills?: string[];
  goals?: string[];
  transport?: Transport;
  firstGen?: boolean;
}

export type Transport = "car" | "rides" | "bus_walk" | "unknown";

export interface Profile {
  nickname?: string;
  birthYear?: number;
  grade?: number; // 6-12
  school?: string;
  zip?: string;
  city?: string;
  interests: string[];
  skills: string[];
  goals: string[];
  transport: Transport;
  firstGen?: boolean;
  counselorName?: string;
  counselorContact?: string;
  /** joined school group (People tab) */
  schoolCode?: string;
  schoolName?: string;
  schoolId?: string;
  shareEngagement?: boolean;
  /** Extra verified roles on this device (People tab): mentor or parent codes */
  mentorCode?: string;
  parentCode?: string;
}

export type SavedStatus = "saved" | "applied" | "accepted" | "declined" | "attended";

export interface SavedItem {
  id: string; // same as opportunity id
  opp: Opportunity;
  status: SavedStatus;
  savedAt: string;
  updatedAt: string;
  notes?: string;
  parentShareToken?: string;
  parentDecision?: "approved" | "declined" | "pending";
  remindersOn?: boolean;
  reviewed?: boolean;
}

export type Horizon = "week" | "month" | "year";

export interface Milestone {
  id: string;
  title: string;
  detail?: string;
  horizon: Horizon;
  done: boolean;
  doneAt?: string;
  /** Finder search that helps with this step */
  searchQuery?: string;
}

export interface Plan {
  id: string;
  goal: string;
  grade?: number;
  hoursPerWeek?: number;
  templateId?: string;
  summary?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  source: "ai" | "template" | "demo";
  sharedCode?: string;
  completedAt?: string;
}

export type CoachMode =
  | "ask"
  | "homework"
  | "interview"
  | "debate"
  | "quiz"
  | "email"
  | "essay"
  | "language";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  at: string;
  crisis?: boolean;
  demo?: boolean;
}

export interface Chat {
  id: string;
  mode: CoachMode;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  /** Interview practice for a specific saved opportunity */
  oppId?: string;
}

export interface Accomplishment {
  id: string;
  title: string;
  kind: "award" | "activity" | "result" | "leadership" | "other";
  date?: string;
  org?: string;
  description?: string;
}

export interface VolunteerLog {
  id: string;
  date: string;
  org: string;
  hours: number;
  activity?: string;
  supervisor?: string;
  supervisorContact?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  earned?: string;
  expires?: string;
  status: "earned" | "in_progress" | "planned";
}

export interface AppNotification {
  id: string;
  text: string;
  at: string;
  read: boolean;
  href?: string;
  key?: string; // de-duplication key
}

export interface SavedSearch {
  id: string;
  query: string;
  createdAt: string;
  lastCheckedAt?: string;
  knownIds: string[];
  newCount?: number;
}

export interface SearchHistoryItem {
  query: string;
  at: string;
  count: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  cards: { front: string; back: string; known?: boolean }[];
  createdAt: string;
}

export type ScheduleKind = "school" | "practice" | "work" | "study" | "rest" | "social" | "family" | "other";

export interface ScheduleBlock {
  id: string;
  day: number; // 0 = Monday
  start: string; // "15:30"
  end: string;
  label: string;
  kind: ScheduleKind;
}

export interface BudgetEntry {
  id: string;
  date: string;
  kind: "earn" | "spend" | "save";
  amount: number;
  note?: string;
  /** For "save" entries: which savings goal it goes toward */
  goalId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
}

export interface PackingList {
  id: string;
  title: string;
  items: { text: string; done: boolean }[];
  createdAt: string;
}

export interface Settings {
  locale: string;
  theme: "system" | "light" | "dark";
  dyslexiaFont: boolean;
  largeText: boolean;
  lowData: boolean;
  onlineOnly: boolean;
  readAloudRate: number;
  inAppReminders: boolean;
  studyBreakMinutes: number; // 0 = off
}

export interface ParentalControls {
  pinHash?: string;
  peopleEnabled: boolean;
  coachEnabled: boolean;
  requireApproval: boolean;
  aiSearchEnabled: boolean;
}
