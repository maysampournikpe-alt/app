import type { Category } from "@/types";

// Words (English + Spanish) that hint at each category. Used by demo search,
// anonymous counselor reports, and to tidy up AI answers.
const HINTS: [Category, RegExp][] = [
  ["internship", /\b(intern(ship)?s?|pasant[ií]as?|pr[aá]cticas|shadow(ing)?|observaci[oó]n)\b/i],
  ["scholarship", /\b(scholarships?|becas?|financial aid|ayuda financiera|grant money)\b/i],
  ["summer_program", /\b(summer (program|institute|academy)|programa de verano|verano)\b/i],
  ["camp", /\b(camps?|campamentos?)\b/i],
  ["volunteer", /\b(volunteer(ing)?|service hours|community service|voluntari(o|a|ado)|horas de servicio|servicio comunitario)\b/i],
  ["job", /\b(jobs?|work|part[- ]time|hiring|empleos?|trabajos?|chamba)\b/i],
  ["sports_competition", /\b(sports?|soccer|football|basketball|baseball|softball|volleyball|track|swim(ming)?|tennis|golf|wrestling|boxing|varsity|deportes?|f[uú]tbol|b[aá]squet|voleibol|atletismo|nataci[oó]n)\b/i],
  ["academic_competition", /\b(competitions?|contests?|olympiads?|tournaments?|bee|science fair|hackathon|debate|uil|mathcounts|chess|competencias?|concursos?|torneos?|olimpiadas?|ajedrez|feria de ciencias)\b/i],
  ["certification", /\b(certifications?|certificates?|certified|cpr|license|certificaci[oó]n|certificados?|licencia)\b/i],
  ["course", /\b(course|class(es)?|lessons?|tutoring|dual (credit|enrollment)|cursos?|clases?|lecciones|tutor[ií]as?|doble cr[eé]dito)\b/i],
  ["club", /\b(clubs?|team|group|clubes?|equipo|grupo)\b/i],
  ["event", /\b(events?|fair|festival|workshop|conference|expo|eventos?|feria|taller|conferencia)\b/i],
];

export function guessCategory(text: string): Category | undefined {
  for (const [cat, re] of HINTS) if (re.test(text)) return cat;
  return undefined;
}

/** Map loose words the AI might use to one of our 12 categories. */
export function normalizeCategory(raw: string | undefined, fallbackText = ""): Category {
  const r = (raw ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  const direct: Record<string, Category> = {
    job: "job",
    jobs: "job",
    internship: "internship",
    academic_competition: "academic_competition",
    competition: "academic_competition",
    sports_competition: "sports_competition",
    sports: "sports_competition",
    event: "event",
    volunteer: "volunteer",
    volunteer_opportunity: "volunteer",
    club: "club",
    scholarship: "scholarship",
    summer_program: "summer_program",
    camp: "camp",
    course: "course",
    class: "course",
    certification: "certification",
  };
  return direct[r] ?? guessCategory(`${raw ?? ""} ${fallbackText}`) ?? "event";
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  job: "💼",
  internship: "🧑‍💻",
  academic_competition: "🏆",
  sports_competition: "🏅",
  event: "📅",
  volunteer: "🤝",
  club: "👥",
  scholarship: "🎓",
  summer_program: "☀️",
  camp: "🏕️",
  course: "📚",
  certification: "📜",
};
