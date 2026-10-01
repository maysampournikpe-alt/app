import type { Opportunity } from "@/types";

const STOP = new Set(["the", "and", "for", "with", "program", "programs", "students", "student", "high", "school", "para", "los", "las", "del", "con", "estudiantes", "programa"]);
const words = (s: string) => new Set(s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w)));

/** "If you liked this, you might like these" (3.1.4): same type or shared topic words. */
export function similarTo(opp: Opportunity, pool: Opportunity[], max = 3): Opportunity[] {
  const mine = words(`${opp.title} ${opp.description}`);
  return pool
    .filter((o) => o.id !== opp.id && !o.tags?.includes("scam-example"))
    .map((o) => {
      let score = o.category === opp.category ? 3 : 0;
      for (const w of words(`${o.title} ${o.description}`)) if (mine.has(w)) score += 1;
      if (o.cost.type === "free" && opp.cost.type === "free") score += 0.5;
      return { o, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.o);
}
