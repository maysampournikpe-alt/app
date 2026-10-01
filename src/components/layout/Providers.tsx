"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { HydratedContext } from "@/lib/hydration";

/**
 * Loads the student's saved data from the device, then keeps the page's
 * theme / font / language in sync with their settings.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const done = () => setHydrated(true);
    const unsub = useApp.persist.onFinishHydration(done);
    useApp.persist.rehydrate();
    if (useApp.persist.hasHydrated()) done();
    return unsub;
  }, []);

  const settings = useApp((s) => s.settings);

  // Apply theme, font and text size classes to <html>.
  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && mq.matches);
      html.classList.toggle("dark", dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? "#0e1416" : "#0b6b66");
    };
    apply();
    html.classList.toggle("dyslexia", settings.dyslexiaFont);
    html.classList.toggle("large-text", settings.largeText);
    html.classList.toggle("low-data", settings.lowData);
    html.lang = settings.locale;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [hydrated, settings]);

  // Register the service worker (offline mode + installable app). Only in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <HydratedContext.Provider value={hydrated}>{children}</HydratedContext.Provider>;
}
