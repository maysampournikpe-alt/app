"use client";

import { GraduationCap } from "lucide-react";
import { useT } from "@/i18n/useT";
import { DUAL_GUIDE } from "@/data/guides";
import { GuidePage } from "@/components/explore/common";

/** 3.2.5 Dual enrollment and early college information. */
export default function DualPage() {
  const { t } = useT();
  return <GuidePage title={t("explore.dual")} subtitle={t("explore.dualSub")} icon={<GraduationCap className="size-7" />} sections={DUAL_GUIDE} />;
}
