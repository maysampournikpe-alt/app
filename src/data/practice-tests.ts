// Practice test questions (Phase 4.4). These are ORIGINAL questions written for Rumbo
// in the style of the SAT, PSAT, ACT and TSI. They are not real test questions.
// Reading & writing questions are in English (the real tests are in English);
// instructions and explanations are bilingual.
import type { Localized } from "@/i18n/config";

export type TestId = "sat" | "psat" | "act" | "tsi";
export type Section = "math" | "rw" | "science";

export interface PracticeQ {
  id: string;
  section: Section;
  tests: TestId[];
  q: Localized | string;
  passage?: string;
  choices: (Localized | string)[];
  answer: number; // index into choices
  explain: Localized;
}

const ALL: TestId[] = ["sat", "psat", "act", "tsi"];

export const QUESTIONS: PracticeQ[] = [
  // ---------- Math ----------
  { id: "m1", section: "math", tests: ALL, q: { en: "If 2x + 3 = 17, what is the value of 4x?", es: "Si 2x + 3 = 17, ¿cuál es el valor de 4x?" }, choices: ["14", "20", "28", "34"], answer: 2, explain: { en: "2x = 14, so x = 7 and 4x = 28. Tip: you can also just double 2x = 14.", es: "2x = 14, así que x = 7 y 4x = 28. Truco: también puedes duplicar 2x = 14." } },
  { id: "m2", section: "math", tests: ["sat", "psat", "act"], q: { en: "A phone plan costs $20 per month plus $0.10 per text. Which expression gives the monthly cost for t texts?", es: "Un plan cuesta $20 al mes más $0.10 por mensaje. ¿Qué expresión da el costo mensual por t mensajes?" }, choices: ["20t + 0.10", "20 + 0.10t", "0.10(20 + t)", "20.10t"], answer: 1, explain: { en: "The $20 is fixed; each text adds $0.10, so 20 + 0.10t.", es: "Los $20 son fijos; cada mensaje suma $0.10, así que 20 + 0.10t." } },
  { id: "m3", section: "math", tests: ALL, q: { en: "Which equation is the line with slope −2 that crosses the y-axis at 3?", es: "¿Qué ecuación es la recta con pendiente −2 que cruza el eje y en 3?" }, choices: ["y = 3x − 2", "y = −2x + 3", "y = 2x + 3", "y = −3x + 2"], answer: 1, explain: { en: "Slope-intercept form is y = mx + b, with m = −2 and b = 3.", es: "La forma pendiente-intersección es y = mx + b, con m = −2 y b = 3." } },
  { id: "m4", section: "math", tests: ALL, q: { en: "40% of the 30 students in a class walk to school. How many students walk?", es: "El 40% de los 30 estudiantes de una clase caminan a la escuela. ¿Cuántos caminan?" }, choices: ["10", "12", "14", "18"], answer: 1, explain: { en: "0.40 × 30 = 12.", es: "0.40 × 30 = 12." } },
  { id: "m5", section: "math", tests: ["sat", "psat", "act"], q: { en: "What are the solutions to x² − 5x + 6 = 0?", es: "¿Cuáles son las soluciones de x² − 5x + 6 = 0?" }, choices: ["2 and 3", "−2 and −3", "1 and 6", "−1 and 6"], answer: 0, explain: { en: "Factor: (x − 2)(x − 3) = 0, so x = 2 or x = 3.", es: "Factoriza: (x − 2)(x − 3) = 0, así que x = 2 o x = 3." } },
  { id: "m6", section: "math", tests: ALL, q: { en: "The mean of four numbers is 10. Three of them are 8, 9 and 12. What is the fourth?", es: "El promedio de cuatro números es 10. Tres son 8, 9 y 12. ¿Cuál es el cuarto?" }, choices: ["9", "10", "11", "13"], answer: 2, explain: { en: "The total must be 4 × 10 = 40. 40 − (8 + 9 + 12) = 11.", es: "El total debe ser 4 × 10 = 40. 40 − (8 + 9 + 12) = 11." } },
  { id: "m7", section: "math", tests: ["psat", "tsi", "act"], q: { en: "A rectangle has area 48 and length 8. What is its width?", es: "Un rectángulo tiene área 48 y largo 8. ¿Cuál es su ancho?" }, choices: ["4", "6", "8", "40"], answer: 1, explain: { en: "Area = length × width, so width = 48 ÷ 8 = 6.", es: "Área = largo × ancho, así que ancho = 48 ÷ 8 = 6." } },
  { id: "m8", section: "math", tests: ALL, q: { en: "Which expression is equivalent to 3(x − 2) + 2x?", es: "¿Qué expresión es equivalente a 3(x − 2) + 2x?" }, choices: ["5x − 2", "5x − 6", "3x − 6", "6x − 2"], answer: 1, explain: { en: "3x − 6 + 2x = 5x − 6.", es: "3x − 6 + 2x = 5x − 6." } },
  { id: "m9", section: "math", tests: ["sat", "psat", "tsi"], q: { en: "A recipe uses 3 cups of flour for 12 cookies. How many cups are needed for 30 cookies?", es: "Una receta usa 3 tazas de harina para 12 galletas. ¿Cuántas tazas se necesitan para 30 galletas?" }, choices: ["6", "7.5", "9", "10"], answer: 1, explain: { en: "3 ÷ 12 = 0.25 cups per cookie. 0.25 × 30 = 7.5.", es: "3 ÷ 12 = 0.25 tazas por galleta. 0.25 × 30 = 7.5." } },
  { id: "m10", section: "math", tests: ["sat", "act"], q: { en: "If f(x) = x² + 1, what is f(−3)?", es: "Si f(x) = x² + 1, ¿cuánto es f(−3)?" }, choices: ["−8", "−5", "7", "10"], answer: 3, explain: { en: "(−3)² = 9, and 9 + 1 = 10.", es: "(−3)² = 9, y 9 + 1 = 10." } },
  { id: "m11", section: "math", tests: ["sat", "psat", "act"], q: { en: "A price goes from $50 to $60. What is the percent increase?", es: "Un precio sube de $50 a $60. ¿Cuál es el porcentaje de aumento?" }, choices: ["10%", "16.7%", "20%", "60%"], answer: 2, explain: { en: "The increase is $10, and 10 ÷ 50 = 0.20 = 20%.", es: "El aumento es $10, y 10 ÷ 50 = 0.20 = 20%." } },
  { id: "m12", section: "math", tests: ["tsi", "psat"], q: { en: "What is 3/4 + 1/8?", es: "¿Cuánto es 3/4 + 1/8?" }, choices: ["4/12", "4/8", "7/8", "1"], answer: 2, explain: { en: "3/4 = 6/8, and 6/8 + 1/8 = 7/8.", es: "3/4 = 6/8, y 6/8 + 1/8 = 7/8." } },
  { id: "m13", section: "math", tests: ["tsi", "act"], q: { en: "What is |−7| − |3|?", es: "¿Cuánto es |−7| − |3|?" }, choices: ["−10", "−4", "4", "10"], answer: 2, explain: { en: "Absolute values: 7 − 3 = 4.", es: "Valores absolutos: 7 − 3 = 4." } },
  { id: "m14", section: "math", tests: ["sat", "tsi", "psat"], q: { en: "If y = 2x and x + y = 9, what is x?", es: "Si y = 2x y x + y = 9, ¿cuánto vale x?" }, choices: ["2", "3", "4.5", "6"], answer: 1, explain: { en: "Substitute: x + 2x = 9, so 3x = 9 and x = 3.", es: "Sustituye: x + 2x = 9, así que 3x = 9 y x = 3." } },

  // ---------- ACT-style science ----------
  { id: "s1", section: "science", tests: ["act"], q: { en: "A student measured how long a sugar cube took to dissolve: 20°C → 60 s, 40°C → 40 s, 60°C → 20 s. Based on the pattern, about how long would it take at 50°C?", es: "Un estudiante midió cuánto tarda un cubo de azúcar en disolverse: 20°C → 60 s, 40°C → 40 s, 60°C → 20 s. Según el patrón, ¿cuánto tardaría a 50°C?" }, choices: ["10 s", "30 s", "50 s", "70 s"], answer: 1, explain: { en: "Time drops 10 s for every 10°C. 50°C is halfway between 40°C (40 s) and 60°C (20 s): 30 s.", es: "El tiempo baja 10 s por cada 10°C. 50°C está a la mitad entre 40°C (40 s) y 60°C (20 s): 30 s." } },
  { id: "s2", section: "science", tests: ["act"], q: { en: "Plants got 0, 1 or 2 extra hours of light per day, and their height was measured after 3 weeks. What is the independent variable?", es: "Unas plantas recibieron 0, 1 o 2 horas extra de luz al día y se midió su altura después de 3 semanas. ¿Cuál es la variable independiente?" }, choices: [{ en: "Plant height", es: "La altura de la planta" }, { en: "Hours of extra light", es: "Las horas extra de luz" }, { en: "The 3 weeks", es: "Las 3 semanas" }, { en: "The type of soil", es: "El tipo de tierra" }], answer: 1, explain: { en: "The independent variable is what the scientist changes on purpose: the extra light.", es: "La variable independiente es lo que el científico cambia a propósito: la luz extra." } },
  { id: "s3", section: "science", tests: ["act"], q: { en: "In a study, air pressure went down as altitude went up. Compared to 1,000 m, air pressure at 3,000 m is most likely:", es: "En un estudio, la presión del aire bajó al subir la altitud. Comparada con 1,000 m, la presión a 3,000 m probablemente es:" }, choices: [{ en: "higher", es: "mayor" }, { en: "lower", es: "menor" }, { en: "the same", es: "igual" }, { en: "impossible to tell", es: "imposible de saber" }], answer: 1, explain: { en: "The trend says higher altitude → lower pressure, so 3,000 m has lower pressure.", es: "La tendencia dice más altitud → menos presión, así que a 3,000 m la presión es menor." } },

  // ---------- Reading & writing (English) ----------
  { id: "r1", section: "rw", tests: ALL, q: "Each of the students ___ a laptop for the project.", choices: ["have", "has", "are having", "were having"], answer: 1, explain: { en: "“Each” is singular, so it takes the singular verb “has.”", es: "“Each” es singular, así que lleva el verbo singular “has.”" } },
  { id: "r2", section: "rw", tests: ALL, q: "Which choice is punctuated correctly?", choices: ["The team practiced every day, as a result they won.", "The team practiced every day; as a result, they won.", "The team practiced every day as a result, they won.", "The team practiced, every day as a result they won."], answer: 1, explain: { en: "Use a semicolon to join two complete sentences, and a comma after the transition “as a result.”", es: "Usa punto y coma para unir dos oraciones completas, y coma después de la transición “as a result.”" } },
  { id: "r3", section: "rw", tests: ["sat", "psat", "tsi"], q: "The scientist was skeptical of the claim, so she asked for more evidence. As used here, “skeptical” most nearly means:", choices: ["excited", "doubtful", "confused", "angry"], answer: 1, explain: { en: "She wanted more evidence because she doubted the claim. “Skeptical” = doubtful.", es: "Quería más evidencia porque dudaba de la afirmación. “Skeptical” = que duda." } },
  { id: "r4", section: "rw", tests: ALL, q: "Many students work after school. ___, they still find time to volunteer.", choices: ["Therefore", "For example", "Nevertheless", "Similarly"], answer: 2, explain: { en: "The second sentence is a surprising contrast, so “Nevertheless” fits.", es: "La segunda oración es un contraste sorprendente, así que “Nevertheless” (sin embargo) queda." } },
  { id: "r5", section: "rw", tests: ["sat", "psat", "act"], q: "Which choice is the most concise and clear?", choices: ["The reason why I was late is because the bus broke down.", "I was late because the bus broke down.", "Due to the fact that the bus broke down, being late was what happened.", "The bus, which broke down, was the reason why I was late, because of that."], answer: 1, explain: { en: "It says the same thing in the fewest words without repeating “reason” and “because.”", es: "Dice lo mismo con menos palabras, sin repetir “reason” y “because.”" } },
  { id: "r6", section: "rw", tests: ALL, q: "The box of crayons ___ on the table.", choices: ["is", "are", "were", "be"], answer: 0, explain: { en: "The subject is “box” (singular), not “crayons,” so use “is.”", es: "El sujeto es “box” (singular), no “crayons,” así que se usa “is.”" } },
  { id: "r7", section: "rw", tests: ["act", "tsi", "psat"], q: "Maria and ___ went to the library after school.", choices: ["me", "I", "myself", "mine"], answer: 1, explain: { en: "Remove “Maria and”: “I went to the library” sounds right, so use “I.”", es: "Quita “Maria and”: “I went to the library” suena bien, así que se usa “I.”" } },
  { id: "r8", section: "rw", tests: ["act", "tsi", "sat"], q: "Which choice is punctuated correctly?", choices: ["After the game ended we, went home.", "After the game ended, we went home.", "After, the game ended we went home.", "After the game, ended we went home."], answer: 1, explain: { en: "Put a comma after an introductory clause like “After the game ended.”", es: "Pon una coma después de una frase introductoria como “After the game ended.”" } },
  {
    id: "r9", section: "rw", tests: ALL,
    passage: "The Rio Grande Valley in South Texas is known for growing citrus, especially grapefruit. Its warm climate lets fruit grow for much of the year. Farmers there ship grapefruit to stores across the country.",
    q: "Which choice best states the main idea of the passage?",
    choices: ["Grapefruit is healthier than other fruits.", "The Valley's warm climate makes it an important citrus-growing region.", "Farmers in Texas only grow grapefruit.", "Stores across the country sell many kinds of fruit."],
    answer: 1,
    explain: { en: "Every sentence supports the idea that the Valley is a major citrus region because of its climate.", es: "Cada oración apoya la idea de que el Valle es una región citrícola importante por su clima." },
  },
  { id: "r10", section: "rw", tests: ["sat", "psat", "tsi"], q: "Carlos checked the weather app twice and packed an umbrella in his backpack. It can most reasonably be inferred that Carlos:", choices: ["forgot his homework", "expected rain", "dislikes his phone", "was going to the beach"], answer: 1, explain: { en: "Checking the weather and packing an umbrella suggest he thought it might rain.", es: "Revisar el clima y llevar paraguas sugiere que pensaba que podía llover." } },
  { id: "r11", section: "rw", tests: ["act", "sat", "tsi"], q: "The ___ backpacks were piled by the door. (The backpacks belong to several students.)", choices: ["student's", "students'", "students", "students's"], answer: 1, explain: { en: "For a plural noun ending in s, put the apostrophe after the s: students'.", es: "Para un plural que termina en s, el apóstrofo va después de la s: students'." } },
  { id: "r12", section: "rw", tests: ["act", "psat"], q: "She likes swimming, biking, and ___.", choices: ["to run", "running", "she runs", "run"], answer: 1, explain: { en: "Keep the list parallel: swimming, biking, running.", es: "Mantén la lista paralela: swimming, biking, running." } },
  { id: "r13", section: "rw", tests: ["tsi", "act"], q: "Which sentence is best for a polite email to an organization you don't know?", choices: ["hey whats up, u guys got any jobs??", "I am writing to ask whether you have volunteer opportunities for high school students.", "Give me a volunteer job.", "Yo! Need hours. Hit me up."], answer: 1, explain: { en: "Formal, complete sentences and a clear question make the best impression.", es: "Las oraciones formales y completas con una pregunta clara dan la mejor impresión." } },
  { id: "r14", section: "rw", tests: ["tsi", "sat"], q: "Which of these is a run-on sentence?", choices: ["I studied all night, so I was tired.", "I studied all night I was tired the next day.", "Because I studied all night, I was tired.", "I studied all night; I was tired the next day."], answer: 1, explain: { en: "Two complete sentences are joined with no punctuation or connecting word — that's a run-on.", es: "Dos oraciones completas están unidas sin puntuación ni conector — eso es una oración corrida (run-on)." } },
];

export const TESTS: { id: TestId; name: string; count: number; minutes: number }[] = [
  { id: "sat", name: "SAT", count: 12, minutes: 16 },
  { id: "psat", name: "PSAT", count: 10, minutes: 13 },
  { id: "act", name: "ACT", count: 12, minutes: 14 },
  { id: "tsi", name: "TSI", count: 10, minutes: 15 },
];
