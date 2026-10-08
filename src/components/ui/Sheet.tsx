"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * A pop-up panel built on the Radix dialog: a sheet that slides up from the
 * bottom on phones, and a centered dialog on bigger screens. It traps keyboard focus,
 * closes with Esc or by tapping outside, and returns focus to where you were.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  closeLabel = "Close",
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  closeLabel?: string;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          data-slot="sheet-content"
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-md border-2 border-b-0 border-foreground bg-background p-5 pt-0 text-foreground outline-none",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-10",
            "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:border-b-2 sm:shadow-[8px_8px_0_var(--block)]",
            "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
            wide ? "sm:max-w-2xl" : "sm:max-w-lg",
          )}
        >
          <div className="-mx-5 mb-4 flex items-center justify-between gap-3 border-b-2 border-foreground bg-block px-5 py-3 text-ink">
            <DialogPrimitive.Title className="font-display text-xl leading-tight uppercase">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={closeLabel}
              className="-mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-md opacity-80 transition-opacity outline-none hover:bg-black/10 hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
