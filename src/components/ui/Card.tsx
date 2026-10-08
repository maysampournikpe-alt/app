import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Poster-style cards: black outline with a hard offset shadow. Link cards get a big color block.

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card" className={cn("rounded-md border-2 border-foreground bg-card p-4 text-card-foreground shadow-[4px_4px_0_var(--border)]", className)} {...rest} />;
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
      data-slot="linkcard"
      className={cn(
        "press group flex items-stretch gap-0 overflow-hidden rounded-md border-2 border-foreground bg-card text-card-foreground shadow-[4px_4px_0_var(--border)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_var(--border)] active:translate-x-1 active:translate-y-1 active:shadow-none",
        className,
      )}
    >
      {icon && (
        <span aria-hidden="true" className="flex w-16 shrink-0 items-center justify-center border-r-2 border-foreground bg-[var(--tile,var(--block))] text-2xl text-ink [&_svg]:size-7">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 self-center p-4">
        <span className="flex items-center gap-2 font-display text-base uppercase leading-tight">
          {title}
          {badge}
        </span>
        {subtitle && <span className="mt-0.5 block text-sm text-muted-foreground">{subtitle}</span>}
      </span>
      <ChevronRight aria-hidden="true" className="mr-3 size-6 shrink-0 self-center transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
