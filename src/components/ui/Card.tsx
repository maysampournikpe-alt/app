import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Cards in the shadcn/ui style (white card, thin border, small shadow).
// For cards with a header/title/content layout, use the parts in "@/components/shadcn/card".

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card" className={cn("rounded-xl border bg-card p-4 text-card-foreground shadow-sm", className)} {...rest} />;
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
      data-slot="card"
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-surface-2/60",
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xl text-on-primary-soft">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-semibold">
          {title}
          {badge}
        </span>
        {subtitle && <span className="mt-0.5 block text-sm text-muted-foreground">{subtitle}</span>}
      </span>
      <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
