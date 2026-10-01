"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";

/**
 * Small jobs that run while the app is open:
 *  - keep the daily streak going
 * (More are added in later phases: deadline reminders, study breaks, celebrations.)
 */
export function BackgroundTasks() {
  const touchStreak = useApp((s) => s.touchStreak);
  useEffect(() => {
    touchStreak();
  }, [touchStreak]);
  return null;
}
