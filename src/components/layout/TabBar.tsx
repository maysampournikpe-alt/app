"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/useT";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, activeTab } from "./nav-items";

/** Bottom tab bar on phones, left side bar on big screens. */
export function TabBar() {
  const pathname = usePathname();
  const { t } = useT();
  const active = activeTab(pathname);
  return (
    <nav
      aria-label={t("nav.main")}
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:inset-y-0 lg:right-auto lg:left-0 lg:w-56 lg:border-t-0 lg:border-r lg:bg-background lg:pt-20"
    >
      <ul className="mx-auto flex max-w-lg justify-around lg:max-w-none lg:flex-col lg:gap-1 lg:px-3">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const isActive = active === key;
          return (
            <li key={key} className="flex-1 lg:flex-none">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors lg:min-h-10 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-md lg:px-3 lg:text-sm",
                  isActive ? "text-primary lg:bg-surface-2 lg:text-foreground" : "text-muted-foreground hover:text-foreground lg:hover:bg-surface-2/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors lg:h-auto lg:w-auto",
                    isActive && "bg-primary-soft text-on-primary-soft lg:bg-transparent lg:text-primary",
                  )}
                >
                  <Icon aria-hidden="true" className="size-6 lg:size-5" strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {t(`nav.${key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
