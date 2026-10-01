"use client";

import { useEffect } from "react";
import { useApp, profileSummary } from "@/lib/store";
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

  // Trending near you: when something new is saved, add 1 to its anonymous area count.
  useEffect(() => {
    return useApp.subscribe((state, prev) => {
      if (state.saved.length <= prev.saved.length) return;
      const added = state.saved.filter((s) => !prev.saved.some((p) => p.id === s.id));
      for (const s of added) {
        const o = s.opp;
        if (!o.sourceUrl || o.tags?.includes("scam-example")) continue;
        void apiPost("/api/trending", {
          area: state.profile.zip?.slice(0, 3),
          opp: { id: o.id, title: o.title, organization: o.organization || undefined, description: o.description.slice(0, 800), category: o.category, cost: { type: o.cost.type, text: o.cost.text }, mode: o.mode, city: o.city, deadline: o.deadline, sourceUrl: o.sourceUrl, source: o.source },
        }).catch(() => {});
      }
    });
  }, []);

  // Saved searches: once a day, re-check the one checked longest ago and count new results.
  useEffect(() => {
    const app = useApp.getState();
    if (!app.savedSearches.length || !navigator.onLine) return;
    const oldest = [...app.savedSearches].sort((a, b) => (a.lastCheckedAt ?? "").localeCompare(b.lastCheckedAt ?? ""))[0];
    if (oldest.lastCheckedAt && oldest.lastCheckedAt.slice(0, 10) === todayISO()) return;
    void apiPost<{ results: { id: string }[] }>("/api/search", {
      query: oldest.query,
      locale: app.settings.locale,
      location: { zip: app.profile.zip, city: app.profile.city },
      profile: profileSummary(app),
      lowData: app.settings.lowData,
    })
      .then((r) => {
        const fresh = r.results.filter((x) => !oldest.knownIds.includes(x.id)).length;
        useApp.getState().updateSavedSearch(oldest.id, { lastCheckedAt: new Date().toISOString(), newCount: fresh });
        if (fresh > 0) useApp.getState().notify({ text: t("explore.alertNew", { q: oldest.query }), href: "/", key: `ss-${oldest.id}-${todayISO()}` });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Study break reminders (Phase 7)
  const breakMinutes = useApp((s) => s.settings.studyBreakMinutes);
  useEffect(() => {
    if (!breakMinutes) return;
    const id = window.setInterval(() => {
      useApp.getState().notify({ text: t("wellbeing.breakNow"), href: "/help", key: `break-${Date.now()}` });
    }, breakMinutes * 60_000);
    return () => window.clearInterval(id);
  }, [breakMinutes, t]);

  return <Celebration />;
}
