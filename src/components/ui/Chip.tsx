"use client";

import type { ReactNode } from "react";
import { Toggle as TogglePrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A pill-shaped button for filters and choices (poster style: black outline, fills with the tab's color when on).
 * With `selected` it is an on/off toggle (screen readers hear "pressed");
 * without it, it's a plain action button (like the "Try:" search examples).
 */
export function Chip({
  selected,
  onClick,
  children,
  className,
  icon,
  size = "md",
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  size?: "sm" | "md";
}) {
  const cls = cn(
    "press inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-foreground bg-surface font-bold text-foreground outline-none hover:bg-surface-2",
    "focus-visible:ring-[3px] focus-visible:ring-ring/60",
    "data-[state=on]:bg-block data-[state=on]:text-ink data-[state=on]:shadow-[3px_3px_0_var(--border)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4 text-sm",
    className,
  );
  if (selected === undefined) {
    return (
      <button type="button" data-slot="chip" onClick={onClick} className={cls}>
        {icon}
        {children}
      </button>
    );
  }
  return (
    <TogglePrimitive.Root data-slot="chip" pressed={selected} onPressedChange={() => onClick?.()} className={cls}>
      {icon}
      {children}
    </TogglePrimitive.Root>
  );
}
