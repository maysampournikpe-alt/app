"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { Progress as ProgressPrimitive, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Page building blocks.

export function PageHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div data-slot="page-header" className="-mx-4 mb-6 flex items-end justify-between gap-3 border-y-2 border-foreground bg-block px-4 py-7 text-ink first:-mt-5 sm:py-10">
      <div className="min-w-0">
        <h1 className="flex items-center gap-3 text-4xl break-words sm:text-6xl">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg font-bold">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mt-9 mb-4 flex items-center justify-between gap-3 border-b-4 border-foreground pb-2">
      <h2 id={id} className="text-2xl">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Progress bar (shadcn/ui progress, Radix). */
export function ProgressBar({ value, label, className, tone = "primary" }: { value: number; label: string; className?: string; tone?: "primary" | "accent" | "success" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = tone === "accent" ? "bg-[var(--c-orange)]" : tone === "success" ? "bg-[var(--c-green)]" : "bg-primary";
  return (
    <ProgressPrimitive.Root data-slot="progress" value={pct} aria-label={label} className={cn("relative h-5 w-full overflow-hidden rounded-sm border-2 border-foreground bg-surface", className)}>
      <ProgressPrimitive.Indicator className={cn("relative h-full w-full flex-1 transition-all", color)} style={{ transform: `translateX(-${100 - pct}%)` }}>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div data-slot="empty" className="flex flex-col items-center rounded-md border-2 border-dashed border-foreground p-6 text-center">
      {icon && (
        <div aria-hidden="true" className="mb-2 text-4xl">
          {icon}
        </div>
      )}
      <p className="font-display text-lg uppercase">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

type AlertTone = "info" | "warning" | "danger" | "success";
const alertStyles: Record<AlertTone, string> = {
  info: "bg-primary-soft text-on-primary-soft border-primary/25",
  warning: "bg-warning-soft text-warning border-warning/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  success: "bg-success-soft text-success border-success/30",
};
const alertIcons = { info: Info, warning: AlertTriangle, danger: ShieldAlert, success: CheckCircle2 };

/** Notice box (shadcn/ui alert layout with Rumbo's colors). Only pass role="alert"/"status" when it should be announced. */
export function Alert({ tone = "info", title, children, className, role }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; className?: string; role?: string }) {
  const Icon = alertIcons[tone];
  return (
    <div
      data-slot="alert"
      role={role}
      className={cn("relative grid w-full grid-cols-[calc(var(--spacing)*5)_1fr] items-start gap-x-3 gap-y-0.5 rounded-md border-2 border-current px-4 py-3 text-sm", alertStyles[tone], className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5" />
      {title && <p className="col-start-2 text-base font-bold">{title}</p>}
      {children && <div className="col-start-2 min-w-0 [&_p]:leading-relaxed">{children}</div>}
    </div>
  );
}

/** Segmented control (like tabs) for switching between a few views. shadcn/ui toggle group, one choice at a time. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      data-slot="tabs-list"
      className="flex overflow-x-auto rounded-md border-2 border-foreground bg-surface no-scrollbar"
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className={cn(
            "min-h-11 flex-1 shrink-0 border-r-2 border-foreground px-3 text-sm font-bold whitespace-nowrap uppercase text-foreground outline-none last:border-r-0 hover:bg-surface-2",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "focus-visible:ring-inset data-[state=on]:bg-foreground data-[state=on]:text-background",
          )}
        >
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
