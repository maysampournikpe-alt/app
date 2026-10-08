"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { Progress as ProgressPrimitive, ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Page building blocks in the shadcn/ui style.

export function PageHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-semibold tracking-tight">
        {children}
      </h2>
      {action}
    </div>
  );
}

/** Progress bar (shadcn/ui progress, Radix). */
export function ProgressBar({ value, label, className, tone = "primary" }: { value: number; label: string; className?: string; tone?: "primary" | "accent" | "success" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = tone === "accent" ? "bg-accent" : tone === "success" ? "bg-success" : "bg-primary";
  return (
    <ProgressPrimitive.Root data-slot="progress" value={pct} aria-label={label} className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <ProgressPrimitive.Indicator className={cn("h-full w-full flex-1 rounded-full transition-all", color)} style={{ transform: `translateX(-${100 - pct}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div data-slot="empty" className="flex flex-col items-center rounded-xl border border-dashed p-6 text-center">
      {icon && (
        <div aria-hidden="true" className="mb-2 text-4xl">
          {icon}
        </div>
      )}
      <p className="font-semibold">{title}</p>
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
      className={cn("relative grid w-full grid-cols-[calc(var(--spacing)*5)_1fr] items-start gap-x-3 gap-y-0.5 rounded-lg border px-4 py-3 text-sm", alertStyles[tone], className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5" />
      {title && <p className="col-start-2 font-semibold">{title}</p>}
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
      className="flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1 no-scrollbar"
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className={cn(
            "min-h-10 flex-1 shrink-0 rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-[color,box-shadow] outline-none hover:text-foreground",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm",
          )}
        >
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}
