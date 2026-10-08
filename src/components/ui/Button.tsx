import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Rumbo's buttons: bold poster style. Black outline, sharp corners, uppercase text and a hard
// offset shadow that disappears when pressed. At least 44px tall; text can wrap.

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "press inline-flex items-center justify-center gap-2 rounded-md border-2 border-foreground font-display text-center uppercase tracking-wide whitespace-normal select-none outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/60 [&_svg]:pointer-events-none [&_svg]:shrink-0";
const pop = "shadow-[3px_3px_0_var(--border)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
const variants: Record<Variant, string> = {
  primary: `bg-foreground text-background ${pop} shadow-[3px_3px_0_var(--block)] hover:shadow-[4px_4px_0_var(--block)]`,
  secondary: `bg-surface text-foreground ${pop}`,
  ghost: "border-transparent normal-case tracking-normal font-sans font-bold hover:bg-surface-2",
  danger: `bg-danger text-white dark:text-black ${pop}`,
  soft: `bg-block text-ink ${pop}`,
  accent: `bg-sun text-ink ${pop}`,
};
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1 text-xs",
  md: "min-h-12 px-5 py-2 text-sm",
  lg: "min-h-14 px-7 py-2.5 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", full?: boolean, className?: string) {
  return cn(base, variants[variant], sizes[size], full ? "w-full min-w-0" : "shrink-0", className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
}

/** Our standard button. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, full, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} data-slot="button" className={buttonClass(variant, size, full, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  full,
  className,
  children,
  external,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
  className?: string;
  children: ReactNode;
  external?: boolean;
  "aria-label"?: string;
}) {
  const cls = buttonClass(variant, size, full, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** Icon-only button. Always needs a label for screen readers. */
export function IconButton({
  label,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-md text-current outline-none hover:bg-current/10 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:opacity-50", className)} {...rest}>
      {children}
    </button>
  );
}
