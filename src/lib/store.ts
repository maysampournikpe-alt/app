"use client";

// The student's data store. EVERYTHING here stays on the student's own device
// (saved in the browser's localStorage). Nothing personal is sent to our server
// unless the student explicitly shares it (e.g. "Share with my parent").

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Accomplishment,
  AppNotification,
  BudgetEntry,
  Certificate,
  Chat,
  ChatMessage,
  CoachMode,
  FlashcardDeck,
  Milestone,
  Opportunity,
  PackingList,
  ParentalControls,
  Plan,
  Profile,
  SavedItem,
  SavedSearch,
  SavedStatus,
  SavingsGoal,
  ScheduleBlock,
  SearchHistoryItem,
  Settings,
  VolunteerLog,
} from "@/types";
import { uid, todayISO } from "./utils";
import { XP_RULES, type XpReason } from "./gamification";

export const STORE_KEY = "rumbo-v1";

export interface Consent {
  onboarded: boolean;
  under13: boolean;
  parentConsentAt?: string;
  parentConsentName?: string; // relationship only, e.g. "Mom"
  privacyAcceptedAt?: string;
}

export interface XpEvent {
  reason: XpReason;
  xp: number;
  at: string;
}

export interface AvatarConfig {
  color: string;
  face: string;
  hat: string;
  frame: string;
}

export interface ResumeInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  cityLine?: string;
  gradYear?: string;
  gpa?: string;
  objective?: string;
  /** AI-polished bullet text, by entry id */
  bullets: Record<string, string>;
}

export interface AppState {
  deviceId: string;
  profile: Profile;
  settings: Settings;
  consent: Consent;
  parental: ParentalControls;
  saved: SavedItem[];
  plans: Plan[];
  chats: Chat[];
  history: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  accomplishments: Accomplishment[];
  volunteer: VolunteerLog[];
  certificates: Certificate[];
  notifications: AppNotification[];
  decks: FlashcardDeck[];
  schedule: ScheduleBlock[];
  budget: BudgetEntry[];
  savingsGoals: SavingsGoal[];
  packing: PackingList[];
  xp: number;
  xpLog: XpEvent[];
  streak: { count: number; best: number; lastDay?: string };
  avatar: AvatarConfig;
  dailyDone: string[]; // dates (YYYY-MM-DD) when the daily challenge was completed
  practiceScores: { test: string; score: number; total: number; at: string }[];
  celebrate?: { title: string; at: string; kind?: "accepted" | "plan" } | null;
  resume: ResumeInfo;
  lastSeenVersion?: string;

  // ---- actions ----
  setProfile: (p: Partial<Profile>) => void;
  setSettings: (s: Partial<Settings>) => void;
  setConsent: (c: Partial<Consent>) => void;
  setParental: (p: Partial<ParentalControls>) => void;

  saveOpportunity: (o: Opportunity) => void;
  unsave: (id: string) => void;
  setSavedStatus: (id: string, status: SavedStatus) => void;
  updateSaved: (id: string, patch: Partial<SavedItem>) => void;

  addPlan: (p: Omit<Plan, "id" | "createdAt" | "updatedAt">) => string;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  toggleMilestone: (planId: string, milestoneId: string) => void;
  replaceMilestones: (planId: string, milestones: Milestone[], summary?: string) => void;
  deletePlan: (id: string) => void;

  startChat: (mode: CoachMode, title: string, oppId?: string) => string;
  addChatMessage: (chatId: string, m: ChatMessage) => void;
  updateLastAssistant: (chatId: string, text: string, extra?: Partial<ChatMessage>) => void;
  deleteChat: (id: string) => void;

  addHistory: (query: string, count: number) => void;
  clearHistory: () => void;
  addSavedSearch: (query: string, knownIds: string[]) => void;
  updateSavedSearch: (id: string, patch: Partial<SavedSearch>) => void;
  removeSavedSearch: (id: string) => void;

  addAccomplishment: (a: Omit<Accomplishment, "id">) => void;
  removeAccomplishment: (id: string) => void;
  addVolunteer: (v: Omit<VolunteerLog, "id">) => void;
  removeVolunteer: (id: string) => void;
  addCertificate: (c: Omit<Certificate, "id">) => void;
  updateCertificate: (id: string, patch: Partial<Certificate>) => void;
  removeCertificate: (id: string) => void;

  notify: (n: Omit<AppNotification, "id" | "at" | "read">) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;

  addDeck: (d: Omit<FlashcardDeck, "id" | "createdAt">) => string;
  updateDeck: (id: string, patch: Partial<FlashcardDeck>) => void;
  removeDeck: (id: string) => void;

  setSchedule: (blocks: ScheduleBlock[]) => void;
  addBudget: (e: Omit<BudgetEntry, "id">) => void;
  removeBudget: (id: string) => void;
  setSavingsGoals: (g: SavingsGoal[]) => void;
  addPacking: (p: Omit<PackingList, "id" | "createdAt">) => string;
  updatePacking: (id: string, patch: Partial<PackingList>) => void;
  removePacking: (id: string) => void;

  awardXp: (reason: XpReason) => void;
  touchStreak: () => void;
  completeDaily: () => void;
  addPracticeScore: (test: string, score: number, total: number) => void;
  setAvatar: (a: Partial<AvatarConfig>) => void;
  setResume: (r: Partial<ResumeInfo>) => void;
  triggerCelebrate: (title: string, kind?: "accepted" | "plan") => void;
  clearCelebrate: () => void;

  importData: (data: Partial<AppState>) => void;
  resetAll: () => void;
}

export const defaultSettings: Settings = {
  locale: "en",
  theme: "system",
  dyslexiaFont: false,
  largeText: false,
  lowData: false,
  onlineOnly: false,
  readAloudRate: 1,
  inAppReminders: true,
  studyBreakMinutes: 0,
};

const defaultParental: ParentalControls = {
  peopleEnabled: true,
  coachEnabled: true,
  requireApproval: false,
  aiSearchEnabled: true,
};

function freshData() {
  return {
    deviceId: uid(20),
    profile: { interests: [], skills: [], goals: [], transport: "unknown" } as Profile,
    settings: { ...defaultSettings },
    consent: { onboarded: false, under13: false } as Consent,
    parental: { ...defaultParental },
    saved: [] as SavedItem[],
    plans: [] as Plan[],
    chats: [] as Chat[],
    history: [] as SearchHistoryItem[],
    savedSearches: [] as SavedSearch[],
    accomplishments: [] as Accomplishment[],
    volunteer: [] as VolunteerLog[],
    certificates: [] as Certificate[],
    notifications: [] as AppNotification[],
    decks: [] as FlashcardDeck[],
    schedule: [] as ScheduleBlock[],
    budget: [] as BudgetEntry[],
    savingsGoals: [] as SavingsGoal[],
    packing: [] as PackingList[],
    xp: 0,
    xpLog: [] as XpEvent[],
    streak: { count: 0, best: 0 },
    avatar: { color: "teal", face: "smile", hat: "none", frame: "none" } as AvatarConfig,
    dailyDone: [] as string[],
    practiceScores: [] as AppState["practiceScores"],
    celebrate: null,
    resume: { bullets: {} } as ResumeInfo,
  };
}

const now = () => new Date().toISOString();
const MAX_CHATS = 20;

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...freshData(),

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (x) => set((s) => ({ settings: { ...s.settings, ...x } })),
      setConsent: (c) => set((s) => ({ consent: { ...s.consent, ...c } })),
      setParental: (p) => set((s) => ({ parental: { ...s.parental, ...p } })),

      // ---------- Saved opportunities ----------
      saveOpportunity: (o) => {
        if (get().saved.some((x) => x.id === o.id)) return;
        const parentDecision = get().consent.under13 && get().parental.requireApproval ? "pending" : undefined;
        set((s) => ({
          saved: [
            { id: o.id, opp: o, status: "saved", savedAt: now(), updatedAt: now(), parentDecision, remindersOn: true },
            ...s.saved,
          ],
        }));
        get().awardXp("save");
      },
      unsave: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
      setSavedStatus: (id, status) => {
        const before = get().saved.find((x) => x.id === id);
        set((s) => ({
          saved: s.saved.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)),
        }));
        if (before && before.status !== status) {
          if (status === "applied") get().awardXp("apply");
          if (status === "attended") get().awardXp("attend");
          if (status === "accepted") {
            get().awardXp("accepted");
            get().triggerCelebrate(before.opp.title);
          }
        }
      },
      updateSaved: (id, patch) =>
        set((s) => ({ saved: s.saved.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: now() } : x)) })),

      // ---------- Plans ----------
      addPlan: (p) => {
        const id = uid();
        set((s) => ({ plans: [{ ...p, id, createdAt: now(), updatedAt: now() }, ...s.plans] }));
        get().awardXp("plan_created");
        return id;
      },
      updatePlan: (id, patch) =>
        set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)) })),
      toggleMilestone: (planId, milestoneId) => {
        let nowDone = false;
        let planDone = false;
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const milestones = p.milestones.map((m) => {
              if (m.id !== milestoneId) return m;
              nowDone = !m.done;
              return { ...m, done: nowDone, doneAt: nowDone ? now() : undefined };
            });
            planDone = milestones.length > 0 && milestones.every((m) => m.done);
            return { ...p, milestones, updatedAt: now(), completedAt: planDone ? p.completedAt ?? now() : undefined };
          }),
        }));
        if (nowDone) get().awardXp("plan_step");
        if (planDone) {
          get().awardXp("plan_complete");
          const plan = get().plans.find((p) => p.id === planId);
          if (plan) get().triggerCelebrate(plan.goal, "plan");
        }
      },
      replaceMilestones: (planId, milestones, summary) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? { ...p, milestones, summary: summary ?? p.summary, updatedAt: now() } : p,
          ),
        })),
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),

      // ---------- Coach chats ----------
      startChat: (mode, title, oppId) => {
        const id = uid();
        set((s) => ({
          chats: [{ id, mode, title, messages: [], updatedAt: now(), oppId }, ...s.chats].slice(0, MAX_CHATS),
        }));
        return id;
      },
      addChatMessage: (chatId, m) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, m], updatedAt: now() } : c)),
        })),
      updateLastAssistant: (chatId, text, extra) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last && last.role === "assistant") msgs[msgs.length - 1] = { ...last, ...extra, text };
            return { ...c, messages: msgs, updatedAt: now() };
          }),
        })),
      deleteChat: (id) => set((s) => ({ chats: s.chats.filter((c) => c.id !== id) })),

      // ---------- Search history & saved searches ----------
      addHistory: (query, count) =>
        set((s) => ({
          history: [{ query, at: now(), count }, ...s.history.filter((h) => h.query.toLowerCase() !== query.toLowerCase())].slice(0, 30),
        })),
      clearHistory: () => set({ history: [] }),
      addSavedSearch: (query, knownIds) =>
        set((s) =>
          s.savedSearches.some((x) => x.query.toLowerCase() === query.toLowerCase())
            ? s
            : { savedSearches: [{ id: uid(), query, createdAt: now(), lastCheckedAt: now(), knownIds }, ...s.savedSearches].slice(0, 10) },
        ),
      updateSavedSearch: (id, patch) =>
        set((s) => ({ savedSearches: s.savedSearches.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      removeSavedSearch: (id) => set((s) => ({ savedSearches: s.savedSearches.filter((x) => x.id !== id) })),

      // ---------- Tracking ----------
      addAccomplishment: (a) => {
        set((s) => ({ accomplishments: [{ ...a, id: uid() }, ...s.accomplishments] }));
        get().awardXp("accomplishment");
      },
      removeAccomplishment: (id) => set((s) => ({ accomplishments: s.accomplishments.filter((a) => a.id !== id) })),
      addVolunteer: (v) => {
        set((s) => ({ volunteer: [{ ...v, id: uid() }, ...s.volunteer] }));
        get().awardXp("volunteer");
      },
      removeVolunteer: (id) => set((s) => ({ volunteer: s.volunteer.filter((v) => v.id !== id) })),
      addCertificate: (c) => {
        set((s) => ({ certificates: [{ ...c, id: uid() }, ...s.certificates] }));
        if (c.status === "earned") get().awardXp("certificate");
      },
      updateCertificate: (id, patch) => {
        const before = get().certificates.find((c) => c.id === id);
        set((s) => ({ certificates: s.certificates.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
        if (before && before.status !== "earned" && patch.status === "earned") get().awardXp("certificate");
      },
      removeCertificate: (id) => set((s) => ({ certificates: s.certificates.filter((c) => c.id !== id) })),

      // ---------- In-app notifications ----------
      notify: (n) =>
        set((s) => {
          if (n.key && s.notifications.some((x) => x.key === n.key)) return s;
          return { notifications: [{ ...n, id: uid(), at: now(), read: false }, ...s.notifications].slice(0, 50) };
        }),
      markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      clearNotifications: () => set({ notifications: [] }),

      // ---------- Tools ----------
      addDeck: (d) => {
        const id = uid();
        set((s) => ({ decks: [{ ...d, id, createdAt: now() }, ...s.decks] }));
        return id;
      },
      updateDeck: (id, patch) => set((s) => ({ decks: s.decks.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDeck: (id) => set((s) => ({ decks: s.decks.filter((d) => d.id !== id) })),
      setSchedule: (blocks) => set({ schedule: blocks }),
      addBudget: (e) => set((s) => ({ budget: [{ ...e, id: uid() }, ...s.budget] })),
      removeBudget: (id) => set((s) => ({ budget: s.budget.filter((b) => b.id !== id) })),
      setSavingsGoals: (g) => set({ savingsGoals: g }),
      addPacking: (p) => {
        const id = uid();
        set((s) => ({ packing: [{ ...p, id, createdAt: now() }, ...s.packing] }));
        return id;
      },
      updatePacking: (id, patch) => set((s) => ({ packing: s.packing.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePacking: (id) => set((s) => ({ packing: s.packing.filter((p) => p.id !== id) })),

      // ---------- Motivation ----------
      awardXp: (reason) => {
        const xp = XP_RULES[reason];
        set((s) => ({ xp: s.xp + xp, xpLog: [{ reason, xp, at: now() }, ...s.xpLog].slice(0, 300) }));
      },
      touchStreak: () => {
        const today = todayISO();
        const { streak } = get();
        if (streak.lastDay === today) return;
        const yesterday = todayISO(-1);
        const count = streak.lastDay === yesterday ? streak.count + 1 : 1;
        set({ streak: { count, best: Math.max(streak.best, count), lastDay: today } });
        get().awardXp("daily_visit");
      },
      completeDaily: () => {
        const today = todayISO();
        if (get().dailyDone.includes(today)) return;
        set((s) => ({ dailyDone: [today, ...s.dailyDone].slice(0, 400) }));
        get().awardXp("daily_challenge");
      },
      addPracticeScore: (test, score, total) => {
        set((s) => ({ practiceScores: [{ test, score, total, at: now() }, ...s.practiceScores].slice(0, 100) }));
        get().awardXp("practice_test");
      },
      setAvatar: (a) => set((s) => ({ avatar: { ...s.avatar, ...a } })),
      setResume: (r) => set((s) => ({ resume: { ...s.resume, ...r } })),
      triggerCelebrate: (title, kind = "accepted") => set({ celebrate: { title, at: now(), kind } }),
      clearCelebrate: () => set({ celebrate: null }),

      // ---------- My data ----------
      importData: (data) => set((s) => ({ ...s, ...data })),
      resetAll: () => set({ ...freshData() }),
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // We rehydrate manually after the page loads (see Providers) so the
      // server-rendered HTML and the first browser render always match.
      skipHydration: true,
      partialize: (s) => {
        // Only data is saved, not functions.
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s)) if (typeof v !== "function") out[k] = v;
        return out as Partial<AppState>;
      },
      merge: (persisted, current) => {
        // Merge nested objects so new settings added in later versions get defaults.
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          settings: { ...current.settings, ...(p.settings ?? {}) },
          profile: { ...current.profile, ...(p.profile ?? {}) },
          consent: { ...current.consent, ...(p.consent ?? {}) },
          parental: { ...current.parental, ...(p.parental ?? {}) },
          avatar: { ...current.avatar, ...(p.avatar ?? {}) },
          streak: { ...current.streak, ...(p.streak ?? {}) },
          resume: { ...current.resume, ...(p.resume ?? {}) },
        };
      },
    },
  ),
);

/** Age from birth year (approximate — we never ask for a full birthday). */
export function ageFromBirthYear(birthYear?: number): number | undefined {
  if (!birthYear) return undefined;
  return new Date().getFullYear() - birthYear;
}

/** The only profile details that are ever sent to the AI. No nickname, school, or exact location. */
export function profileSummary(state: Pick<AppState, "profile">) {
  const p = state.profile;
  return {
    grade: p.grade,
    age: ageFromBirthYear(p.birthYear),
    interests: p.interests.slice(0, 8),
    skills: p.skills.slice(0, 8),
    goals: p.goals.slice(0, 5),
    transport: p.transport,
    firstGen: p.firstGen,
  };
}
