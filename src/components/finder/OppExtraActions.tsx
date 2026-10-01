"use client";

import type { Opportunity } from "@/types";

/**
 * Extra actions for an opportunity (share with a parent, calendar, flyer, reviews...).
 * Filled in by later phases so the details panel stays simple.
 */
export function OppExtraActions({ opp }: { opp: Opportunity }) {
  void opp;
  return null;
}
