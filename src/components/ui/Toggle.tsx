"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** An on/off switch. Uses role="switch" so screen readers announce "on" or "off". */
export function Toggle({
  checked,
  onChange,
  label,
  help,
  className,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  help?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="block font-bold">
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="mt-0.5 text-sm text-muted">
            {help}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={help ? `${id}-help` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors disabled:opacity-50",
          checked ? "border-primary bg-primary" : "border-border bg-surface-2",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-6 rounded-full shadow transition-transform",
            checked ? "translate-x-6 bg-on-primary" : "translate-x-0.5 bg-muted",
          )}
        />
      </button>
    </div>
  );
}
