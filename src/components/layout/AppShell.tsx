"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hydration";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { OfflineBanner } from "./OfflineBanner";
import { Logo } from "./Logo";
import { BackgroundTasks } from "./BackgroundTasks";

/** Pages anyone can open without finishing the welcome steps (parents, staff, judges). */
const PUBLIC_PREFIXES = ["/welcome", "/privacy", "/how-ai-works", "/help", "/parent", "/staff", "/offline"];
/** Pages without the student tab bar. */
const NO_TABS_PREFIXES = ["/welcome", "/parent", "/staff", "/flyer"];

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();
  const onboarded = useApp((s) => s.consent.onboarded);
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const showTabs = onboarded && !NO_TABS_PREFIXES.some((p) => pathname.startsWith(p));
  const mustOnboard = hydrated && !onboarded && !isPublic;

  // First time here? Go to the welcome steps.
  useEffect(() => {
    if (mustOnboard) router.replace("/welcome");
  }, [mustOnboard, router]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 font-bold text-on-primary focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t("common.skipToContent")}
      </a>
      <Header minimal={!showTabs} />
      <OfflineBanner />
      <main id="main" tabIndex={-1} className={cn("mx-auto w-full max-w-5xl px-4 pt-5 focus:outline-none lg:pl-60 print:p-0", showTabs ? "pb-tabbar" : "pb-10")}>
        {!hydrated || mustOnboard ? (
          <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4" role="status">
            <Logo className="size-16 animate-pulse" />
            <span className="sr-only">{t("common.loading")}</span>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">{children}</div>
        )}
      </main>
      {showTabs && hydrated && <TabBar />}
      {hydrated && onboarded && <BackgroundTasks />}
    </>
  );
}
