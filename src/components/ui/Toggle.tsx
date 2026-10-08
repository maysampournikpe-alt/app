"use client";

import { useId, type ReactNode } from "react";
import { Switch } from "@/components/shadcn/switch";
import { Label } from "@/components/shadcn/label";
import { cn } from "@/lib/utils";

/** An on/off setting with a label, using the shadcn/ui switch (screen readers announce "on" or "off"). */
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
        <Label htmlFor={id} className="block text-sm leading-snug font-semibold">
          {label}
        </Label>
        {help && (
          <p id={`${id}-help`} className="mt-1 text-sm text-muted-foreground">
            {help}
          </p>
        )}
      </div>
      {/* Bigger than shadcn's default switch so it's easy to tap. */}
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={help ? `${id}-help` : undefined}
        size="lg"
        className="mt-0.5"
      />
    </div>
  );
}
