"use client";

import type { ReactNode } from "react";
import { Toggle as TogglePrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A pill-shaped button for filters and choices (a chunky game-style button).
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
    "press inline-flex shrink-0 items-center gap-1.5 rounded-2xl border-2 border-b-4 border-border bg-surface font-display font-extrabold text-text outline-none hover:bg-surface-2 active:border-b-2",
    "focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "data-[state=on]:border-primary data-[state=on]:bg-primary-soft data-[state=on]:text-on-primary-soft",
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
