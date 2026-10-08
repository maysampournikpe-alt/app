import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { buttonVariants } from "@/components/shadcn/button";
import { cn } from "@/lib/utils";

// Rumbo's buttons, built on the shadcn/ui button. Same look as shadcn, but:
//  - at least 44px tall (easy to tap for younger students),
//  - text can wrap onto two lines (long Spanish labels on small phones),
//  - extra "soft" and "accent" styles for Rumbo's brand colors.

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft" | "accent";
type Size = "sm" | "md" | "lg";

const variantMap: Record<Variant, Parameters<typeof buttonVariants>[0]> = {
  primary: { variant: "default" },
  secondary: { variant: "outline" },
  ghost: { variant: "ghost" },
  danger: { variant: "destructive" },
  soft: { variant: "secondary" },
  accent: { variant: "secondary" },
};
const extra: Record<Variant, string> = {
  primary: "hover:bg-primary-hover",
  secondary: "border-input bg-card dark:bg-card",
  ghost: "",
  danger: "",
  soft: "bg-primary-soft text-on-primary-soft hover:bg-primary-soft/75",
  accent: "bg-accent-soft text-on-accent-soft hover:bg-accent-soft/75",
};
const sizes: Record<Size, string> = {
  sm: "h-auto min-h-9 px-3 py-1.5 text-sm",
  md: "h-auto min-h-11 px-4 py-2 text-sm",
  lg: "h-auto min-h-12 px-6 py-2.5 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", full?: boolean, className?: string) {
  return cn(buttonVariants(variantMap[variant]), "whitespace-normal text-center font-semibold select-none", extra[variant], sizes[size], full && "w-full min-w-0 shrink", className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
}

/** Our standard button (shadcn/ui style). */
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

/** Icon-only button (shadcn ghost icon button). Always needs a label for screen readers. */
export function IconButton({
  label,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-11 rounded-full", className)} {...rest}>
      {children}
    </button>
  );
}
