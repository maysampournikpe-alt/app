// Age-appropriate filter (Safety 1.5.4).
// Hides results that are not right for the student's age or grade, and adult topics.
import type { Opportunity } from "@/types";

// Topics never shown to students (ages 11–18), in English and Spanish.
const ADULT_TOPICS =
  /\b(casino|gambling|sports ?betting|lottery|bar ?tending|bartender|nightclub|night club|hookah|vape|vaping|tobacco|cigar|liquor|beer|wine tasting|brewery|cannabis|marijuana|dispensary|dating|onlyfans|adult entertainment|modeling agency.*(fee|portfolio)|firearm sales|gun show|apuestas|cantina|cerveza|licor|tabaco|citas rom[aá]nticas)\b/i;

export interface AgeContext {
  age?: number;
  grade?: number;
}

export type AgeVerdict = "ok" | "hide" | "check";

/** Decide whether to show an opportunity to a student of this age/grade. */
export function ageVerdict(o: Partial<Opportunity>, ctx: AgeContext): AgeVerdict {
  const text = `${o.title ?? ""} ${o.description ?? ""} ${o.organization ?? ""}`;
  if (ADULT_TOPICS.test(text)) return "hide";
  if (/\b(21\+|21 and (over|older)|must be 21|18\+ only|adults only|solo adultos|mayores de (18|21))\b/i.test(text)) return "hide";

  const { age, grade } = ctx;
  if (age !== undefined) {
    if (o.ages?.min !== undefined && o.ages.min >= 18 && age < 17) return "hide";
    if (o.ages?.min !== undefined && o.ages.min - age >= 2) return "hide";
    if (o.ages?.max !== undefined && age - o.ages.max >= 1) return "hide";
    if (o.ages?.min !== undefined && o.ages.min > age) return "check";
  }
  if (grade !== undefined) {
    if (o.grades?.min !== undefined && o.grades.min - grade >= 2) return "hide";
    if (o.grades?.max !== undefined && grade - o.grades.max >= 1) return "hide";
    if (o.grades?.min !== undefined && o.grades.min > grade) return "check";
  }
  return "ok";
}

export function filterByAge(list: Opportunity[], ctx: AgeContext): Opportunity[] {
  return list.filter((o) => ageVerdict(o, ctx) !== "hide");
}
