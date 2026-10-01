"use client";
import { useT } from "@/i18n/useT";
import { PageHeader } from "@/components/ui/misc";

export default function Page() {
  const { t } = useT();
  return <PageHeader title={t("nav.people")} subtitle={t("common.comingSoon")} />;
}
