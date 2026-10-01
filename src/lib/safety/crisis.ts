// Detects messages that mean a student may be in danger (Safety 1.5.3).
// When this matches, the app shows trusted help lines right away instead of
// normal coaching. It errs on the side of caution, in English and Spanish.

export type CrisisKind = "self_harm" | "abuse" | "danger";

const PATTERNS: { kind: CrisisKind; re: RegExp }[] = [
  {
    kind: "self_harm",
    re: /\b(kill(ing)? myself|suicid(e|al)|end (my|it all)|want(ed)? to die|wanna die|don'?t want to (live|be alive|exist)|hurt(ing)? myself|cut(ting)? myself|self[- ]?harm|no reason to live|better off dead|matarme|suicid(arme|io)|quiero morir(me)?|no quiero vivir|hacerme da[nñ]o|cortarme|lastimarme)\b/i,
  },
  {
    kind: "abuse",
    re: /\b((he|she|they|my (dad|mom|stepdad|stepmom|uncle|parent|boyfriend|coach|teacher)) (hits|beats|touches|touched|abuses|hurts) me|being abused|sexually abused|molest(ed|ing)?|someone touched me|me (pega|golpea|toca|toc[oó]|abusa|lastima)|abus(o|aron|an) (de )?m[ií]|me violaron|rape(d)?)\b/i,
  },
  {
    kind: "danger",
    re: /\b(someone (is )?(following|threatening) me|i'?m (in danger|not safe)|unsafe at home|kicked out of (my )?house|run(ning)? away from home|have a gun at school|going to shoot|bomb at school|me (est[aá]n )?amenaza(n|ndo)|no estoy a salvo|estoy en peligro|me corrieron de (mi )?casa)\b/i,
  },
];

export function detectCrisis(text: string): CrisisKind | null {
  for (const p of PATTERNS) if (p.re.test(text)) return p.kind;
  return null;
}

// Requests the app should politely refuse without asking the AI at all.
const BLOCKED =
  /\b(porn|nudes?|sext|onlyfans|buy (weed|drugs|vapes?|alcohol|a gun)|fake id|how to (make|build) a (bomb|weapon)|hack (someone|an account)|cheat on (the|my) (test|exam) without|comprar (droga|mota|alcohol|armas)|identificaci[oó]n falsa)\b/i;

export function isBlockedRequest(text: string): boolean {
  return BLOCKED.test(text);
}
