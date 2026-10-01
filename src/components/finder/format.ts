"use client";

import type { Opportunity } from "@/types";
import type { TFunction } from "@/i18n/translate";
import { daysUntil, formatDate } from "@/lib/utils";

/** Human-friendly text for an opportunity's details. Unknown → "Not listed, check with organizer". */
export function oppFacts(o: Opportunity, t: TFunction, dateLocale: string) {
  const nl = t("common.notListed");
  const cost =
    o.cost.type === "free" ? (o.cost.text ? `${t("common.free")} — ${o.cost.text}` : t("common.free")) : o.cost.type === "paid" ? (o.cost.text ?? t("find.costPaid")) : (o.cost.text ?? nl);

  let who = nl;
  const g = o.grades;
  const a = o.ages;
  const parts: string[] = [];
  if (g?.min !== undefined && g?.max !== undefined) parts.push(g.min === g.max ? t("common.gradeN", { n: g.min }) : t("common.grades", { min: g.min, max: g.max }));
  else if (g?.min !== undefined) parts.push(t("common.gradesMin", { min: g.min }));
  else if (g?.max !== undefined) parts.push(t("common.gradesMax", { max: g.max }));
  if (a?.min !== undefined && a?.max !== undefined) parts.push(t("common.ages", { min: a.min, max: a.max }));
  else if (a?.min !== undefined) parts.push(t("common.agesMin", { min: a.min }));
  else if (a?.max !== undefined) parts.push(t("common.agesMax", { max: a.max }));
  if (parts.length) who = parts.join(" · ");
  const whoLong = [parts.join(" · "), o.eligibility].filter(Boolean).join(". ") || nl;

  const when = [o.startDate && t("opp.starts", { date: formatDate(o.startDate, dateLocale) }), o.dateText].filter(Boolean).join(" · ") || nl;
  const days = daysUntil(o.deadline);
  const deadline = o.deadline ? formatDate(o.deadline, dateLocale) : nl;
  const mode = o.mode === "online" ? t("opp.online") : o.mode === "in_person" ? t("opp.inPerson") : o.mode === "hybrid" ? t("opp.hybrid") : t("opp.unknownMode");
  const where = o.mode === "online" ? t("opp.online") : [o.address, o.city].filter(Boolean).join(", ") || (o.mode === "hybrid" ? t("opp.hybrid") : nl);
  const carFree = o.carFree === "yes" ? t("opp.carFreeYes") : o.carFree === "no" ? t("opp.carFreeNo") : t("opp.carFreeUnknown");
  return { cost, who, whoLong, when, deadline, days, mode, where, carFree };
}

/** Turn scam codes into readable sentences. AI-written warnings are shown as they are. */
export function scamTexts(o: Opportunity, t: TFunction): string[] {
  return (o.scamWarnings ?? []).map((w) => (w.startsWith("code:") ? t(`opp.scam_${w.slice(5)}`) : w));
}
