import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border bg-surface p-4 shadow-sm", className)} {...rest} />;
}

/** A tappable card that links somewhere (used in hubs and lists). */
export function LinkCard({
  href,
  icon,
  title,
  subtitle,
  className,
  badge,
}: {
  href: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary",
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl text-on-primary-soft">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-bold">
          {title}
          {badge}
        </span>
        {subtitle && <span className="mt-0.5 block text-sm text-muted">{subtitle}</span>}
      </span>
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted" />
    </Link>
  );
}
