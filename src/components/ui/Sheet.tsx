"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A pop-up panel (bottom sheet on phones, centered dialog on desktop).
 * Uses the native <dialog> element, which traps keyboard focus and closes with Esc.
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
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="sheet-title"
      className={cn(
        "m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-border bg-surface p-0 text-text backdrop:bg-black/50 sm:m-auto sm:rounded-3xl",
        wide ? "sm:max-w-2xl" : "sm:max-w-lg",
      )}
    >
      {open && (
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 id="sheet-title" className="text-xl font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-2"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
