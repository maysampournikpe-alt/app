"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/i18n/useT";
import { dueReminders } from "@/lib/calendar";
import { refreshParentDecision } from "@/lib/family-client";
import { computeStats } from "@/lib/stats";
import { apiPost } from "@/lib/api";
import { todayISO } from "@/lib/utils";
import { Celebration } from "@/components/fun/Celebration";

/**
 * Small jobs that run while the app is open:
 *  - keep the daily streak going
 *  - deadline reminders 1 week and 1 day before (in-app + phone notification if allowed)
 *  - check whether a parent answered an approval request
 *  - (opt-in only) share activity counts with the student's school
 *  - study break reminders
 */
export function BackgroundTasks() {
  const { t } = useT();
  const touchStreak = useApp((s) => s.touchStreak);

  useEffect(() => {
    touchStreak();
    const app = useApp.getState();

    // Deadline reminders
    if (app.settings.inAppReminders) {
      for (const { item, days } of dueReminders(app.saved)) {
        const text =
          days === 0 ? t("calendar.remind0", { title: item.opp.title }) : days === 1 ? t("calendar.remind1", { title: item.opp.title }) : t("calendar.remind7", { title: item.opp.title, days: Math.max(2, Math.round((new Date(item.opp.deadline!).getTime() - Date.now()) / 86_400_000)) });
        const key = `remind-${item.id}-${days === 7 ? "w" : days}`;
        const isNew = !useApp.getState().notifications.some((n) => n.key === key);
        app.notify({ text, href: "/plan/calendar", key });
        if (isNew && typeof Notification !== "undefined" && Notification.permission === "granted") {
          navigator.serviceWorker?.ready
            .then((reg) => reg.showNotification("Rumbo", { body: text, icon: "/icons/icon-192.png", data: { href: "/plan/calendar" }, tag: key }))
            .catch(() => new Notification("Rumbo", { body: text }));
        }
      }
    }

    // Parent answers
    for (const item of app.saved.filter((s) => s.parentDecision === "pending" && s.parentShareToken)) {
      void refreshParentDecision(item).then((d) => {
        if (d && d !== "pending") {
          useApp.getState().notify({ text: d === "approved" ? `${t("family.approved")} — ${item.opp.title}` : `${t("family.declined")} — ${item.opp.title}`, href: "/me/saved", key: `parent-${item.id}-${d}` });
        }
      });
    }

    // Opt-in school sharing (counts only), at most once a day.
    const p = app.profile;
    const lastSync = (() => {
      try {
        return localStorage.getItem("rumbo-school-sync");
      } catch {
        return null;
      }
    })();
    if (p.schoolCode && p.shareEngagement && lastSync !== todayISO()) {
      const st = computeStats(app);
      const month = todayISO().slice(0, 7);
      const monthHours = app.volunteer.filter((v) => v.date.startsWith(month)).reduce((n, v) => n + v.hours, 0);
      void apiPost("/api/school/engagement", {
        code: p.schoolCode,
        nickname: p.nickname,
        grade: p.grade,
        searches: st.searches,
        saves: st.saved,
        applied: st.applied,
        planSteps: st.planSteps,
        hours: st.hours,
        monthHours,
      })
        .then(() => {
          try {
            localStorage.setItem("rumbo-school-sync", todayISO());
          } catch {
            /* ignore */
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Study break reminders (Phase 7)
  const breakMinutes = useApp((s) => s.settings.studyBreakMinutes);
  useEffect(() => {
    if (!breakMinutes) return;
    const id = window.setInterval(() => {
      useApp.getState().notify({ text: t("wellbeing.breakNow"), href: "/plan/wellbeing", key: `break-${Date.now()}` });
    }, breakMinutes * 60_000);
    return () => window.clearInterval(id);
  }, [breakMinutes, t]);

  return <Celebration />;
}
