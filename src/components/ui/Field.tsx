import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border-2 border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-muted focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-focus";

/** A labeled form field. The label is always connected to the input for screen readers. */
export function Field({
  label,
  help,
  children,
  id,
  className,
  hideLabel,
}: {
  label: ReactNode;
  help?: ReactNode;
  children: (id: string, describedBy?: string) => ReactNode;
  id?: string;
  className?: string;
  hideLabel?: boolean;
}) {
  const auto = useId();
  const fid = id ?? auto;
  const helpId = help ? `${fid}-help` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={fid} className={cn("block font-bold", hideLabel && "sr-only")}>
        {label}
      </label>
      {children(fid, helpId)}
      {help && (
        <p id={helpId} className="text-sm text-muted">
          {help}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(inputCls, className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn(inputCls, "min-h-24", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={cn(inputCls, "pr-8", className)} {...rest}>
      {children}
    </select>
  );
});
