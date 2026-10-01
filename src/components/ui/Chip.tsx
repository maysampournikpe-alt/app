"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A pill-shaped toggle button used for filters and multiple choice. */
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
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 font-bold transition-colors",
        size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4 text-sm",
        selected ? "border-primary bg-primary text-on-primary" : "border-border bg-surface text-text hover:border-primary",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
