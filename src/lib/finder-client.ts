"use client";

import { create } from "zustand";
import type { Category, FinderResponse, Opportunity } from "@/types";
import { daysUntil } from "./utils";
import { apiPost } from "./api";
import { useApp, profileSummary } from "./store";
import type { CrisisKind } from "./safety/crisis";

export interface FinderFilters {
  category?: Category;
  cost: "any" | "free" | "paid";
  myGrade: boolean;
  maxMiles?: number;
  where: "any" | "online" | "in_person";
  deadline: "any" | "2w" | "1m" | "has";
  paidOnly: boolean;
}

export const DEFAULT_FILTERS: FinderFilters = { cost: "any", myGrade: false, where: "any", deadline: "any", paidOnly: false };

export function countActiveFilters(f: FinderFilters): number {
  return [f.category, f.cost !== "any", f.myGrade, f.maxMiles, f.where !== "any", f.deadline !== "any", f.paidOnly].filter(Boolean).length;
}

/** Apply the student's filters to search results (done on the phone, so changing filters is instant). */
export function applyFilters(list: Opportunity[], f: FinderFilters, ctx: { grade?: number; onlineOnly?: boolean }): Opportunity[] {
  return list.filter((o) => {
    if (f.category && o.category !== f.category) return false;
    if (f.cost === "free" && o.cost.type !== "free") return false;
    if (f.cost === "paid" && o.cost.type !== "paid") return false;
    if (f.paidOnly && !o.paid) return false;
    if (f.myGrade && ctx.grade) {
      if (o.grades?.min !== undefined && o.grades.min > ctx.grade) return false;
      if (o.grades?.max !== undefined && o.grades.max < ctx.grade) return false;
    }
    const where = ctx.onlineOnly ? "online" : f.where;
    if (where === "online" && o.mode !== "online" && o.mode !== "hybrid") return false;
    if (where === "in_person" && o.mode === "online") return false;
    if (f.maxMiles && o.mode !== "online" && o.distanceMiles !== undefined && o.distanceMiles > f.maxMiles) return false;
    if (f.deadline !== "any") {
      const d = daysUntil(o.deadline);
      if (d === undefined || d < 0) return false;
      if (f.deadline === "2w" && d > 14) return false;
      if (f.deadline === "1m" && d > 31) return false;
    }
    return true;
  });
}

export type FinderResult = FinderResponse & { crisis?: CrisisKind; blocked?: boolean };

interface FinderSession {
  query: string;
  lastQuery: string;
  loading: boolean;
  error: boolean;
  response: FinderResult | null;
  filters: FinderFilters;
  geo?: { lat: number; lng: number };
  setQuery: (q: string) => void;
  setFilters: (f: Partial<FinderFilters>) => void;
  resetFilters: () => void;
  setGeo: (g?: { lat: number; lng: number }) => void;
  search: (q?: string) => Promise<FinderResult | null>;
}

/** Search state for this visit (not saved — searches stay private and fresh). */
export const useFinder = create<FinderSession>()((set, get) => ({
  query: "",
  lastQuery: "",
  loading: false,
  error: false,
  response: null,
  filters: DEFAULT_FILTERS,
  setQuery: (query) => set({ query }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setGeo: (geo) => set({ geo }),
  search: async (q) => {
    const query = (q ?? get().query).trim();
    if (query.length < 2) return null;
    const app = useApp.getState();
    set({ loading: true, error: false, query, lastQuery: query });
    const { geo, filters } = get();
    try {
      const res = await apiPost<FinderResult>("/api/search", {
        query,
        locale: app.settings.locale,
        location: geo
          ? { lat: Math.round(geo.lat * 100) / 100, lng: Math.round(geo.lng * 100) / 100 }
          : { zip: app.profile.zip, city: app.profile.city },
        profile: profileSummary(app),
        filters: {
          freeOnly: filters.cost === "free" || undefined,
          onlineOnly: app.settings.onlineOnly || filters.where === "online" || undefined,
          paidOnly: filters.paidOnly || undefined,
          category: filters.category,
        },
        lowData: app.settings.lowData,
        schoolCode: app.profile.schoolCode,
      });
      set({ response: res, loading: false });
      if (!res.crisis && !res.blocked) app.addHistory(query, res.results.length);
      return res;
    } catch {
      set({ loading: false, error: true });
      return null;
    }
  },
}));
