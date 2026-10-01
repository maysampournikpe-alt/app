"use client";

import { FileText } from "lucide-react";
import { useT } from "@/i18n/useT";
import { FAFSA_GUIDE } from "@/data/guides";
import { GuidePage } from "@/components/explore/common";

/** 3.2.7 FAFSA helper: plain-language financial aid guide in English and Spanish. */
export default function FafsaPage() {
  const { t } = useT();
  return <GuidePage title={t("explore.fafsa")} subtitle={t("explore.fafsaSub")} icon={<FileText className="size-7" />} sections={FAFSA_GUIDE} />;
}
