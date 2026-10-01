import "server-only";
import { DEMO_OPPORTUNITIES, SUGGESTION_TOPICS, GENERAL_SUGGESTIONS, type DemoOpp } from "@/data/demo-opportunities";
import { pickLocalized, translate } from "@/i18n/translate";
import { guessCategory } from "@/lib/categories";
import type { Opportunity, Suggestion } from "@/types";
import type { FinderRequest } from "./types";
import { contactScripts } from "./scripts";

/** Turn a bilingual demo item into a normal Opportunity in the student's language. */
export function localizeDemo(d: DemoOpp, locale: string): Opportunity {
  const L = (x?: { en: string; es: string }) => (x ? pickLocalized(x, locale) : undefined);
  return {
    id: d.id,
    title: L(d.title)!,
    organization: d.organization,
    description: L(d.description)!,
    category: d.category,
    cost: { type: d.cost.type, text: L(d.cost.text), feeWaiver: L(d.cost.feeWaiver) },
    paid: d.paid,
    payText: L(d.payText),
    grades: d.grades,
    ages: d.ages,
    eligibility: L(d.eligibility),
    deadline: d.deadline,
    startDate: d.startDate,
    dateText: L(d.dateText),
    mode: d.mode,
    city: d.city,
    carFree: d.carFree,
    transitNote: L(d.transitNote),
    sourceUrl: d.sourceUrl,
    source: "demo",
    tags: d.scamExample ? ["scam-example"] : undefined,
  };
}

const STOP = new Set(["for", "the", "and", "near", "me", "in", "a", "an", "of", "to", "high", "school", "schoolers", "students", "student", "para", "de", "en", "la", "el", "los", "las", "cerca", "mi", "estudiantes", "un", "una", "y"]);

// Common words that say little about the topic count for less.
const GENERIC = new Set(["middle", "competition", "competitions", "competencia", "competencias", "concurso", "concursos", "program", "programs", "programa", "programas", "opportunity", "opportunities", "oportunidades", "online", "free", "gratis", "linea", "teens", "kids", "summer", "verano"]);

function words(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9+]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function strip(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** A short "Why this fits you" line for sample results, built from the profile. */
function demoWhy(d: DemoOpp, req: FinderRequest): string {
  const es = req.locale === "es";
  const reasons: string[] = [];
  const interest = (req.profile.interests ?? []).find((i) => d.tags.some((t) => strip(t).includes(strip(i))));
  if (interest) {
    const label = translate(req.locale, `interests.${interest}`).toLowerCase();
    reasons.push(es ? `coincide con tu interés en ${label}` : `matches your interest in ${label}`);
  }
  if (d.cost.type === "free") reasons.push(es ? "es gratis" : "it's free");
  if (d.mode === "online" && req.profile.transport !== "car") reasons.push(es ? "es en línea, no necesitas que te lleven" : "it's online, so you don't need a ride");
  if (req.profile.grade && d.grades?.min !== undefined && d.grades.min <= req.profile.grade && (d.grades.max ?? 12) >= req.profile.grade)
    reasons.push(es ? `es para tu grado (${req.profile.grade}.º)` : `it's open to grade ${req.profile.grade}`);
  if (d.paid) reasons.push(es ? "te pagan" : "you get paid");
  if (!reasons.length) reasons.push(es ? "es una buena forma de ganar experiencia" : "it's a good way to build experience");
  const text = reasons.slice(0, 2).join(es ? " y " : " and ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

/** Very simple keyword search over the sample data. */
export function demoSearch(req: FinderRequest): { results: Opportunity[]; suggestions: Suggestion[]; topic: string } {
  const q = req.query;
  const qWords = words(q);
  const cat = guessCategory(q);
  const interests = (req.profile.interests ?? []).map(strip);

  const scored = DEMO_OPPORTUNITIES.map((d) => {
    let score = 0;
    if (cat && d.category === cat) score += 4;
    const tags = d.tags.map(strip);
    const hay = strip(`${d.title.en} ${d.title.es} ${d.description.en} ${d.description.es} ${d.organization}`);
    for (const w of qWords) {
      const weight = GENERIC.has(w) ? 1 : 3;
      if (tags.some((t) => t === w || t.startsWith(w) || w.startsWith(t))) score += weight;
      else if (hay.includes(w)) score += 1;
    }
    // A tiny boost for things that match the student's interests.
    if (score > 0 && interests.some((i) => tags.some((t) => t.includes(i)))) score += 1;
    if (d.scamExample && !(cat === "job")) score = 0;
    return { d, score };
  })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score);

  const results = scored
    .slice(0, req.lowData ? 5 : 10)
    .map((x) => ({ ...localizeDemo(x.d, req.locale), whyFits: x.d.scamExample ? undefined : demoWhy(x.d, req) }));

  // Suggestions: places that MIGHT offer this, with contact scripts.
  const topicEntry = SUGGESTION_TOPICS.find((t) => t.match.test(q));
  const topic = q.trim().replace(/\s+/g, " ").slice(0, 60) || (req.locale === "es" ? "esto" : "this");
  const places = [...(topicEntry?.places ?? []), ...(results.length < 3 ? GENERAL_SUGGESTIONS : [])].slice(0, 4);
  const suggestions: Suggestion[] = places.map((p, i) => {
    const name = pickLocalized(p.name, req.locale);
    const scripts = contactScripts(req.locale, name, topic, req.profile.grade);
    return {
      id: `demo-sug-${i}-${strip(name).replace(/[^a-z]+/g, "-")}`,
      name,
      kind: pickLocalized(p.kind, req.locale),
      why: pickLocalized(p.why, req.locale),
      howToFind: pickLocalized(p.howToFind, req.locale),
      emailScript: scripts.email,
      phoneScript: scripts.phone,
    };
  });
  return { results, suggestions, topic };
}
