// Trusted, free help lines (U.S. / Texas). Shown on the Help page and whenever
// the AI notices a student may be in danger. Checked October 2026.
import type { Localized } from "@/i18n/config";

export interface Helpline {
  id: string;
  name: Localized;
  what: Localized;
  call?: string; // phone number to dial
  text?: { number: string; word?: string; wordEs?: string };
  url: string;
  spanish: boolean;
  urgent?: boolean;
}

export const HELPLINES: Helpline[] = [
  {
    id: "911",
    name: { en: "Emergency: 911", es: "Emergencia: 911" },
    what: { en: "If you or someone else is in danger right now.", es: "Si tú u otra persona están en peligro ahora mismo." },
    call: "911",
    url: "https://www.911.gov/",
    spanish: true,
    urgent: true,
  },
  {
    id: "988",
    name: { en: "988 Suicide & Crisis Lifeline", es: "988 Línea de Prevención del Suicidio y Crisis" },
    what: {
      en: "Free, 24/7, private. Call or text 988 if you feel hopeless, very stressed, or are thinking about hurting yourself. Press 2 for Spanish.",
      es: "Gratis, 24/7, privado. Llama o manda un texto al 988 si te sientes sin esperanza, muy estresado(a) o piensas en hacerte daño. Marca 2 para español.",
    },
    call: "988",
    text: { number: "988" },
    url: "https://988lifeline.org/",
    spanish: true,
    urgent: true,
  },
  {
    id: "crisistext",
    name: { en: "Crisis Text Line", es: "Crisis Text Line (en español)" },
    what: {
      en: "Text with a trained counselor, 24/7. Text HOME to 741741 (English) or AYUDA to 741741 (Spanish).",
      es: "Escríbele a un consejero capacitado, 24/7. Manda AYUDA al 741741, o por WhatsApp al 442-AYUDAME.",
    },
    text: { number: "741741", word: "HOME", wordEs: "AYUDA" },
    url: "https://www.crisistextline.org/",
    spanish: true,
    urgent: true,
  },
  {
    id: "childhelp",
    name: { en: "Childhelp National Child Abuse Hotline", es: "Childhelp: Línea Nacional contra el Abuso Infantil" },
    what: {
      en: "If someone is hurting you or you don't feel safe at home. Call or text 1-800-422-4453, 24/7.",
      es: "Si alguien te está lastimando o no te sientes seguro(a) en casa. Llama o textea al 1-800-422-4453, 24/7.",
    },
    call: "1-800-422-4453",
    text: { number: "1-800-422-4453" },
    url: "https://www.childhelphotline.org/",
    spanish: true,
    urgent: true,
  },
  {
    id: "txabuse",
    name: { en: "Texas Abuse Hotline", es: "Línea de Texas para Reportar Abuso" },
    what: {
      en: "Report abuse or neglect of a child in Texas. Call 1-800-252-5400, 24/7.",
      es: "Reporta abuso o negligencia de un niño en Texas. Llama al 1-800-252-5400, 24/7.",
    },
    call: "1-800-252-5400",
    url: "https://www.txabusehotline.org/",
    spanish: true,
  },
  {
    id: "loveisrespect",
    name: { en: "love is respect (teen dating)", es: "love is respect (noviazgo adolescente)" },
    what: {
      en: "Help with unhealthy or scary relationships. Call 1-866-331-9474 or text LOVEIS to 22522.",
      es: "Ayuda con relaciones que no son sanas o que dan miedo. Llama al 1-866-331-9474 o textea LOVEIS al 22522.",
    },
    call: "1-866-331-9474",
    text: { number: "22522", word: "LOVEIS" },
    url: "https://www.loveisrespect.org/",
    spanish: true,
  },
  {
    id: "trevor",
    name: { en: "The Trevor Project (LGBTQ+ youth)", es: "The Trevor Project (jóvenes LGBTQ+)" },
    what: {
      en: "24/7 support for LGBTQ+ young people. Call 1-866-488-7386 or text START to 678-678.",
      es: "Apoyo 24/7 para jóvenes LGBTQ+. Llama al 1-866-488-7386 o textea START al 678-678.",
    },
    call: "1-866-488-7386",
    text: { number: "678678", word: "START" },
    url: "https://www.thetrevorproject.org/",
    spanish: true,
  },
  {
    id: "dv",
    name: { en: "National Domestic Violence Hotline", es: "Línea Nacional contra la Violencia Doméstica" },
    what: {
      en: "If there is violence at home. Call 1-800-799-7233 or text START to 88788.",
      es: "Si hay violencia en casa. Llama al 1-800-799-7233 o textea START al 88788.",
    },
    call: "1-800-799-7233",
    text: { number: "88788", word: "START" },
    url: "https://www.thehotline.org/",
    spanish: true,
  },
  {
    id: "samhsa",
    name: { en: "SAMHSA National Helpline", es: "Línea Nacional de SAMHSA" },
    what: {
      en: "Free, private help with drugs, alcohol, or mental health for you or your family. Call 1-800-662-4357.",
      es: "Ayuda gratis y privada sobre drogas, alcohol o salud mental para ti o tu familia. Llama al 1-800-662-4357.",
    },
    call: "1-800-662-4357",
    url: "https://www.samhsa.gov/find-help/helplines/national-helpline",
    spanish: true,
  },
  {
    id: "211",
    name: { en: "2-1-1 Texas", es: "2-1-1 Texas" },
    what: {
      en: "Dial 211 to find food, housing, utility help, and other local services.",
      es: "Marca 211 para encontrar comida, vivienda, ayuda con recibos y otros servicios locales.",
    },
    call: "211",
    url: "https://www.211texas.org/",
    spanish: true,
  },
];

export const URGENT_HELPLINES = HELPLINES.filter((h) => h.urgent);
