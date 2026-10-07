"use client";

import type { ReactNode } from "react";
import { Toggle as TogglePrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A pill-shaped button for filters and choices (shadcn/ui "toggle", outline style).
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
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-input bg-card font-semibold shadow-xs transition-[color,box-shadow,background-color] outline-none hover:bg-surface-2",
    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary-hover",
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
