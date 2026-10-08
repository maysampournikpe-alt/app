import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Rumbo's buttons: chunky "3D" game-style buttons with a darker bottom edge that
// press down when tapped. At least 44px tall, and text can wrap (long Spanish labels).

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "press inline-flex items-center justify-center gap-2 rounded-2xl font-display font-extrabold text-center whitespace-normal select-none outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary border-b-4 border-primary-shadow hover:brightness-110 active:border-b-2",
  secondary: "bg-surface text-text border-2 border-b-4 border-border hover:bg-surface-2 active:border-b-2",
  ghost: "text-text hover:bg-surface-2",
  danger: "bg-danger text-white border-b-4 border-danger-shadow hover:brightness-110 active:border-b-2 dark:text-black",
  soft: "bg-primary-soft text-on-primary-soft border-2 border-b-4 border-primary/25 hover:brightness-105 active:border-b-2",
  accent: "bg-sun text-on-sun border-b-4 border-sun-shadow hover:brightness-105 active:border-b-2",
};
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1 text-sm",
  md: "min-h-12 px-5 py-2 text-base",
  lg: "min-h-14 px-7 py-2.5 text-lg",
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
    <button type="button" aria-label={label} title={label} className={cn("press inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-text outline-none hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50", className)} {...rest}>
      {children}
    </button>
  );
}
