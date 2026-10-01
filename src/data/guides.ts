// Plain-language guides in English and Spanish (FAFSA, dual enrollment, military).
// Rules change, so guides point students to official sources and their counselor.
import type { Localized } from "@/i18n/config";

export interface GuideSection {
  title: Localized;
  body: Localized;
  link?: { label: Localized; url: string };
}

export const FAFSA_GUIDE: GuideSection[] = [
  {
    title: { en: "What is the FAFSA?", es: "¿Qué es la FAFSA?" },
    body: {
      en: "The FAFSA (Free Application for Federal Student Aid) is a FREE form that tells colleges how much help your family needs to pay for college. It can get you grants (free money you don't pay back, like the Pell Grant), work-study jobs, and Texas state aid. Many colleges also use it for their own scholarships.",
      es: "La FAFSA (Solicitud Gratuita de Ayuda Federal para Estudiantes) es un formulario GRATIS que les dice a las universidades cuánta ayuda necesita tu familia para pagar la universidad. Te puede dar becas (dinero que no se devuelve, como la beca Pell), trabajos de estudio y ayuda del estado de Texas. Muchas universidades también la usan para sus propias becas.",
    },
    link: { label: { en: "StudentAid.gov (official)", es: "StudentAid.gov (oficial)" }, url: "https://studentaid.gov/h/apply-for-aid/fafsa" },
  },
  {
    title: { en: "When do I fill it out?", es: "¿Cuándo la lleno?" },
    body: {
      en: "In your senior year. The FAFSA for the 2027–28 school year opens around October 1, 2026 (sometimes a little earlier). Texas's priority deadline is January 15, 2027 — some aid runs out, so earlier is better.",
      es: "En tu último año de prepa. La FAFSA para el año escolar 2027–28 abre alrededor del 1 de octubre de 2026 (a veces un poco antes). La fecha prioritaria de Texas es el 15 de enero de 2027 — parte de la ayuda se acaba, así que mientras más temprano, mejor.",
    },
  },
  {
    title: { en: "Who fills it out?", es: "¿Quién la llena?" },
    body: {
      en: "You and your “contributors” — usually your parent or parents. Each person needs their own free StudentAid.gov account. A parent who doesn't have a Social Security number can still make an account; it just takes a few extra steps to confirm who they are.",
      es: "Tú y tus “contribuyentes” — normalmente tu mamá, tu papá o ambos. Cada persona necesita su propia cuenta gratis en StudentAid.gov. Un padre o madre sin número de seguro social también puede hacer una cuenta; solo toma unos pasos más para confirmar su identidad.",
    },
  },
  {
    title: { en: "What do we need?", es: "¿Qué necesitamos?" },
    body: {
      en: "• Social Security numbers (if you have them)\n• 2025 federal tax returns or W-2s for you and your parents\n• Records of savings and checking account balances\n• A list of colleges you might attend (you can add up to 20)",
      es: "• Números de seguro social (si tienen)\n• Declaraciones de impuestos federales o W-2 de 2025 tuyos y de tus padres\n• Saldos de cuentas de ahorros y de cheques\n• Una lista de universidades a las que podrías ir (puedes agregar hasta 20)",
    },
  },
  {
    title: { en: "Texas: you need it to graduate", es: "Texas: la necesitas para graduarte" },
    body: {
      en: "In Texas, seniors must complete the FAFSA or the TASFA — or turn in an opt-out form — to graduate from high school. Your counselor can help.",
      es: "En Texas, los estudiantes de último año deben llenar la FAFSA o la TASFA — o entregar un formulario para no hacerlo — para graduarse de la prepa. Tu consejero te puede ayudar.",
    },
  },
  {
    title: { en: "What is the TASFA?", es: "¿Qué es la TASFA?" },
    body: {
      en: "The TASFA (Texas Application for State Financial Aid) is for some Texas students who can't file the FAFSA. The rules about who can use it have changed recently, so ask your counselor or a college financial aid office whether it fits your situation. They help families with all kinds of situations, privately.",
      es: "La TASFA (Solicitud de Texas para Ayuda Financiera Estatal) es para algunos estudiantes de Texas que no pueden llenar la FAFSA. Las reglas sobre quién puede usarla cambiaron hace poco, así que pregunta a tu consejero o a la oficina de ayuda financiera de una universidad si te sirve. Ayudan a familias en todo tipo de situaciones, de forma privada.",
    },
    link: { label: { en: "Texas Higher Education Coordinating Board", es: "Junta Coordinadora de Educación Superior de Texas" }, url: "https://www.highered.texas.gov/" },
  },
  {
    title: { en: "Never pay to file", es: "Nunca pagues por llenarla" },
    body: {
      en: "The FAFSA is free at StudentAid.gov. Websites or people who charge a fee to “help” are not needed — your school counselor and college FAFSA nights help for free.",
      es: "La FAFSA es gratis en StudentAid.gov. No necesitas páginas ni personas que cobren por “ayudar” — tu consejero escolar y las noches de FAFSA de las universidades ayudan gratis.",
    },
  },
  {
    title: { en: "After you submit", es: "Después de enviarla" },
    body: {
      en: "You'll get a FAFSA Submission Summary. Colleges that accept you send a financial aid offer. Compare offers: grants and scholarships are free; loans must be paid back. If your family's situation changed (job loss, medical bills), ask the college's aid office about an appeal.",
      es: "Recibirás un resumen de tu FAFSA. Las universidades que te acepten te mandarán una oferta de ayuda. Compáralas: las becas son gratis; los préstamos se tienen que pagar. Si la situación de tu familia cambió (pérdida de trabajo, gastos médicos), pregunta en la oficina de ayuda financiera por una apelación.",
    },
  },
  {
    title: { en: "Get free help", es: "Recibe ayuda gratis" },
    body: {
      en: "Your school counselor, college “FAFSA nights,” and the Federal Student Aid Information Center (1-800-433-3243, with Spanish) can answer questions.",
      es: "Tu consejero escolar, las “noches de FAFSA” de las universidades y el Centro de Información de Ayuda Federal (1-800-433-3243, con español) pueden responder tus preguntas.",
    },
  },
];

export const DUAL_GUIDE: GuideSection[] = [
  {
    title: { en: "What is dual credit?", es: "¿Qué es el doble crédito?" },
    body: {
      en: "Dual credit (also called dual enrollment) means taking a real college class while you're in high school. You earn high school AND college credit at the same time. Some students finish an associate degree before they graduate high school!",
      es: "Doble crédito (también llamado doble inscripción) significa tomar una clase universitaria de verdad mientras estás en la prepa. Ganas créditos de prepa Y de universidad al mismo tiempo. ¡Algunos estudiantes terminan un título técnico antes de graduarse de la prepa!",
    },
  },
  {
    title: { en: "What does it cost?", es: "¿Cuánto cuesta?" },
    body: {
      en: "In the Rio Grande Valley, dual credit is often free for students through partnerships between school districts and colleges like South Texas College, Texas Southmost College and UTRGV. Ask your counselor about books and fees.",
      es: "En el Valle del Río Grande, el doble crédito muchas veces es gratis gracias a acuerdos entre los distritos escolares y universidades como South Texas College, Texas Southmost College y UTRGV. Pregunta a tu consejero por libros y cuotas.",
    },
    link: { label: { en: "STC Dual Credit Programs", es: "Programas de doble crédito de STC" }, url: "https://www.southtexascollege.edu/dual/" },
  },
  {
    title: { en: "Early college high schools", es: "Preparatorias de universidad temprana" },
    body: {
      en: "Early college and collegiate high schools are high schools built around college classes, often on or near a college campus. Many Valley districts have one. Applications usually open in middle school or 8th grade.",
      es: "Las preparatorias de universidad temprana (early college o collegiate) están organizadas alrededor de clases universitarias, a veces en o cerca de un campus. Muchos distritos del Valle tienen una. Las solicitudes suelen abrir en la secundaria o en 8.º grado.",
    },
    link: { label: { en: "UTRGV Collegiate High School", es: "Collegiate High School de UTRGV" }, url: "https://www.utrgv.edu/admissions/non-degree/undergraduate-non-degree/collegiate-high-school/index.htm" },
  },
  {
    title: { en: "The TSI test", es: "El examen TSI" },
    body: {
      en: "Most dual credit students take the TSI (Texas Success Initiative) Assessment to show they're ready for college reading, writing and math — unless their SAT, ACT or other scores already count. You can practice in Coach → Practice tests.",
      es: "La mayoría de estudiantes de doble crédito toman el examen TSI (Texas Success Initiative) para mostrar que están listos para lectura, escritura y matemáticas universitarias — a menos que sus puntajes del SAT, ACT u otros ya cuenten. Puedes practicar en Coach → Exámenes de práctica.",
    },
  },
  {
    title: { en: "Things to know", es: "Cosas que debes saber" },
    body: {
      en: "• Your grades go on a college transcript forever — take it seriously.\n• Core classes usually transfer between Texas public colleges.\n• College classes move faster. Use tutoring early.\n• It can save your family thousands of dollars.",
      es: "• Tus calificaciones quedan en tu historial universitario para siempre — tómalo en serio.\n• Las clases básicas normalmente se transfieren entre universidades públicas de Texas.\n• Las clases universitarias van más rápido. Usa tutorías desde el principio.\n• Puede ahorrarle a tu familia miles de dólares.",
    },
  },
];

export const MILITARY_GUIDE: GuideSection[] = [
  {
    title: { en: "JROTC in high school", es: "JROTC en la prepa" },
    body: {
      en: "Junior ROTC is a high school class and program that teaches leadership, citizenship and teamwork. Joining JROTC does NOT mean you have to join the military.",
      es: "Junior ROTC es una clase y programa de la prepa que enseña liderazgo, civismo y trabajo en equipo. Estar en JROTC NO significa que tengas que entrar al ejército.",
    },
  },
  {
    title: { en: "ROTC in college", es: "ROTC en la universidad" },
    body: {
      en: "ROTC lets you go to college and train to become an officer. Scholarships can pay for tuition. UTRGV has an Army ROTC program in Edinburg and Brownsville.",
      es: "ROTC te deja ir a la universidad y entrenar para ser oficial. Hay becas que pueden pagar la matrícula. UTRGV tiene Army ROTC en Edinburg y Brownsville.",
    },
    link: { label: { en: "UTRGV Army ROTC", es: "Army ROTC de UTRGV" }, url: "https://www.utrgv.edu/cla/schools-and-departments/department-of-military-science-rotc/index.htm" },
  },
  {
    title: { en: "Service academies", es: "Academias militares" },
    body: {
      en: "West Point, the Naval Academy, the Air Force Academy and others offer a free college education plus a job as an officer. Most require a nomination, often from your Member of Congress. Start in the spring of junior year.",
      es: "West Point, la Academia Naval, la Academia de la Fuerza Aérea y otras ofrecen universidad gratis y trabajo como oficial. La mayoría pide una nominación, muchas veces de tu congresista. Empieza en la primavera de 11.º grado.",
    },
  },
  {
    title: { en: "Enlisting after high school", es: "Alistarse después de la prepa" },
    body: {
      en: "You can enlist at 17 with a parent's permission, or at 18 on your own. You'll take the ASVAB test, which helps match you to jobs. The military can pay for college and job training.",
      es: "Puedes alistarte a los 17 con permiso de tus padres, o a los 18 por tu cuenta. Tomarás el examen ASVAB, que ayuda a escoger trabajos. El ejército puede pagar universidad y entrenamiento laboral.",
    },
    link: { label: { en: "Today's Military (official, all branches)", es: "Today's Military (oficial, todas las ramas)" }, url: "https://www.todaysmilitary.com/" },
  },
  {
    title: { en: "Smart questions for a recruiter", es: "Preguntas inteligentes para un reclutador" },
    body: {
      en: "• What job will I do, and is it guaranteed in my contract?\n• How long is my commitment (active and reserve)?\n• What education benefits will I get, and when?\n• Where could I be stationed?\nBring a parent, take your time, and never sign anything you don't understand.",
      es: "• ¿Qué trabajo haré y está garantizado en mi contrato?\n• ¿Cuánto tiempo me comprometo (activo y reserva)?\n• ¿Qué beneficios de educación tendré y cuándo?\n• ¿Dónde me podrían mandar?\nLleva a tu mamá o papá, tómate tu tiempo y nunca firmes algo que no entiendas.",
    },
  },
];
