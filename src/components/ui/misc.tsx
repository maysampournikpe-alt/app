import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";

export function PageHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-bold">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function ProgressBar({ value, label, className, tone = "primary" }: { value: number; label: string; className?: string; tone?: "primary" | "accent" | "success" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color = tone === "accent" ? "bg-accent" : tone === "success" ? "bg-success" : "bg-primary";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: ReactNode; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
      {icon && (
        <div aria-hidden="true" className="mb-2 text-4xl">
          {icon}
        </div>
      )}
      <p className="font-bold">{title}</p>
      {body && <p className="mt-1 text-sm text-muted">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="size-5 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

type AlertTone = "info" | "warning" | "danger" | "success";
const alertStyles: Record<AlertTone, string> = {
  info: "bg-primary-soft text-on-primary-soft border-primary/30",
  warning: "bg-warning-soft text-warning border-warning/40",
  danger: "bg-danger-soft text-danger border-danger/40",
  success: "bg-success-soft text-success border-success/40",
};
const alertIcons = { info: Info, warning: AlertTriangle, danger: ShieldAlert, success: CheckCircle2 };

export function Alert({ tone = "info", title, children, className, role }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; className?: string; role?: string }) {
  const Icon = alertIcons[tone];
  return (
    <div role={role} className={cn("flex gap-3 rounded-2xl border p-3.5", alertStyles[tone], className)}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 text-sm">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

/** Segmented control (like tabs) for switching between a few views. */
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
    <div role="radiogroup" aria-label={label} className="flex gap-1 overflow-x-auto rounded-2xl bg-surface-2 p-1 no-scrollbar">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-10 flex-1 shrink-0 whitespace-nowrap rounded-xl px-3 text-sm font-bold",
            value === o.value ? "bg-surface text-text shadow" : "text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
