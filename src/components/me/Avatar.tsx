"use client";

import { AVATAR_UNLOCKS } from "@/lib/gamification";
import type { AvatarConfig } from "@/lib/store";
import { cn } from "@/lib/utils";

/** The student's avatar (no photos — just colors, faces and hats unlocked with XP). */
export function Avatar({ config, size = "md", className }: { config: AvatarConfig; size?: "sm" | "md" | "lg"; className?: string }) {
  const color = AVATAR_UNLOCKS.colors.find((c) => c.id === config.color)?.value ?? "#0b6b66";
  const face = AVATAR_UNLOCKS.faces.find((f) => f.id === config.face)?.value ?? "😊";
  const hat = AVATAR_UNLOCKS.hats.find((h) => h.id === config.hat)?.value ?? "";
  const frame = config.frame;
  const dims = size === "lg" ? "size-24 text-5xl" : size === "sm" ? "size-10 text-xl" : "size-16 text-3xl";
  return (
    <span aria-hidden="true" className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full", dims, className)} style={{ background: color }}>
      {frame === "ring" && <span className="absolute -inset-1 rounded-full border-4 border-amber-400" />}
      {frame === "glow" && <span className="absolute -inset-1.5 rounded-full shadow-[0_0_16px_6px_rgba(98,214,202,0.7)]" />}
      {frame === "sunset" && <span className="absolute -inset-1 rounded-full border-4" style={{ borderColor: "#f59e0b #c2410c #be185d #6d28d9" }} />}
      <span className="relative">{face}</span>
      {hat && <span className={cn("absolute -top-3", size === "lg" ? "text-4xl" : size === "sm" ? "text-base -top-2" : "text-2xl")}>{hat}</span>}
    </span>
  );
}
