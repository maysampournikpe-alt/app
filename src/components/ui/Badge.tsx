import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Small labels in Rumbo's soft brand colors.
type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger";
const tones: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary-soft text-on-primary-soft",
  accent: "bg-accent-soft text-on-accent-soft",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span data-slot="badge" className={cn("inline-flex w-fit shrink-0 items-center gap-1 rounded-xl px-2.5 py-0.5 font-display text-xs font-extrabold whitespace-normal [&>svg]:size-3.5", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
