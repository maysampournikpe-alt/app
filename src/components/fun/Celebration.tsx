"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { XP_RULES } from "@/lib/gamification";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

const COLORS = ["#f59e0b", "#0b6b66", "#c2410c", "#6d28d9", "#be185d", "#1d4ed8"];

/** 9.7 Celebration screen when a student marks an acceptance or finishes a plan. */
export function Celebration() {
  const { t } = useT();
  const router = useRouter();
  const c = useApp((s) => s.celebrate);
  const clear = useApp((s) => s.clearCelebrate);
  const plan = c?.kind === "plan";
  // Confetti pieces (decoration only; hidden from screen readers; still when reduced motion is on).
  const pieces = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({ left: (i * 37) % 100, delay: (i % 9) * 0.15, color: COLORS[i % COLORS.length], rotate: (i * 47) % 360 })),
    [],
  );
  return (
    <Sheet open={!!c} onClose={clear} title={plan ? t("fun.celebratePlan") : t("fun.celebrateAccepted")} closeLabel={t("common.close")}>
      <div className="relative overflow-hidden text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {pieces.map((p, i) => (
            <span key={i} className="confetti absolute top-0 block h-3 w-2 rounded-sm" style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, rotate: `${p.rotate}deg` }} />
          ))}
        </div>
        <p aria-hidden="true" className="pop-in text-7xl">
          {plan ? "🏁" : "🎉"}
        </p>
        <p className="mt-2 text-xl font-bold">{c ? t("fun.celebrateBody", { title: c.title }) : ""}</p>
        <p className="mt-1 inline-block rounded-full bg-accent-soft px-3 py-1 font-bold text-on-accent-soft">{t("fun.celebrateXp", { n: plan ? XP_RULES.plan_complete : XP_RULES.accepted })}</p>
        <p className="mt-3">{t("fun.celebrateNext")}</p>
        <div className="relative mt-4 flex flex-wrap justify-center gap-2">
          <Button
            variant="soft"
            onClick={() => {
              clear();
              router.push("/me/tracker");
            }}
          >
            {t("fun.celebrateTracker")}
          </Button>
          <Button onClick={clear}>{t("fun.celebrateClose")}</Button>
        </div>
      </div>
    </Sheet>
  );
}
