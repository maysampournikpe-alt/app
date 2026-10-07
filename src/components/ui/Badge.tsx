import type { ReactNode } from "react";
import { badgeVariants } from "@/components/shadcn/badge";
import { cn } from "@/lib/utils";

// shadcn/ui badge with Rumbo's soft brand colors.
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
    <span data-slot="badge" className={cn(badgeVariants({ variant: "secondary" }), "font-semibold whitespace-normal", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
