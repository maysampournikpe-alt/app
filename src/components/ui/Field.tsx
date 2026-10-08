import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Label } from "@/components/shadcn/label";
import { cn } from "@/lib/utils";

// Form fields: big rounded boxes. Inputs are 44px tall (easy to tap) and use 16px text,
// which also stops iPhones from zooming in when you tap a box.
const inputCls =
  "w-full min-w-0 rounded-2xl border-2 border-input bg-surface px-4 py-2 text-base text-foreground transition-[color,box-shadow,border-color] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25 aria-invalid:border-destructive";

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
    <div data-slot="field" className={cn("grid gap-2", className)}>
      <Label htmlFor={fid} className={cn("font-display text-base leading-snug font-extrabold", hideLabel && "sr-only")}>
        {label}
      </Label>
      {children(fid, helpId)}
      {help && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {help}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} data-slot="input" className={cn(inputCls, "min-h-12", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} data-slot="textarea" className={cn(inputCls, "min-h-24", className)} {...rest} />;
});

/** Native <select> in the shadcn "native select" style (keeps phones' built-in pickers). */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} data-slot="native-select" className={cn(inputCls, "select-chevron min-h-12 pr-10", className)} {...rest}>
      {children}
    </select>
  );
});
