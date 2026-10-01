// Static, hand-checked information for the Explore pages (Phase 3.2, 3.1.5, 3.1.10).
// Facts that change (costs, exact deadlines) are NOT hard-coded; we link to the official source.
import type { Localized } from "@/i18n/config";

// ---------------- Colleges (3.2.4) ----------------
export type CollegeType = "community" | "technical" | "public4" | "private4";

export interface College {
  id: string;
  name: string;
  city: string;
  rgv: boolean; // in the Rio Grande Valley
  type: CollegeType;
  cost: 1 | 2 | 3; // $ = lowest
  strengths: string[]; // interest ids from data/interests.ts
  note: Localized;
  url: string;
}

export const COLLEGES: College[] = [
  { id: "utrgv", name: "University of Texas Rio Grande Valley (UTRGV)", city: "Edinburg / Brownsville, TX", rgv: true, type: "public4", cost: 2, strengths: ["medicine", "stem", "coding", "business", "teaching", "art", "music", "law", "community"], note: { en: "Big public university right here in the Valley, with a medical school, engineering, nursing and education. Has Army ROTC.", es: "Universidad pública grande aquí en el Valle, con escuela de medicina, ingeniería, enfermería y educación. Tiene Army ROTC." }, url: "https://www.utrgv.edu/" },
  { id: "stc", name: "South Texas College (STC)", city: "McAllen, TX", rgv: true, type: "community", cost: 1, strengths: ["medicine", "trades", "business", "coding", "stem"], note: { en: "Community college with associate degrees, bachelor's in some fields, health and technical programs, and free dual credit for many high schoolers.", es: "Colegio comunitario con títulos técnicos, algunas licenciaturas, programas de salud y técnicos, y doble crédito gratis para muchos estudiantes de prepa." }, url: "https://www.southtexascollege.edu/" },
  { id: "tsc", name: "Texas Southmost College (TSC)", city: "Brownsville, TX", rgv: true, type: "community", cost: 1, strengths: ["medicine", "trades", "business", "teaching"], note: { en: "Community college in Brownsville with transfer degrees, nursing and workforce programs.", es: "Colegio comunitario en Brownsville con títulos para transferir, enfermería y programas laborales." }, url: "https://www.tsc.edu/" },
  { id: "tstc", name: "Texas State Technical College (TSTC) – Harlingen", city: "Harlingen, TX", rgv: true, type: "technical", cost: 1, strengths: ["trades", "coding", "stem", "agriculture"], note: { en: "Hands-on technical college: welding, HVAC, aviation, IT, nursing and more. Many programs are 2 years or less.", es: "Colegio técnico práctico: soldadura, HVAC, aviación, informática, enfermería y más. Muchos programas duran 2 años o menos." }, url: "https://www.tstc.edu/" },
  { id: "tamuk", name: "Texas A&M University–Kingsville", city: "Kingsville, TX", rgv: false, type: "public4", cost: 2, strengths: ["stem", "agriculture", "animals", "teaching", "music"], note: { en: "About 2 hours north. Known for engineering, agriculture and wildlife programs.", es: "A unas 2 horas al norte. Conocida por ingeniería, agricultura y vida silvestre." }, url: "https://www.tamuk.edu/" },
  { id: "tamucc", name: "Texas A&M University–Corpus Christi", city: "Corpus Christi, TX", rgv: false, type: "public4", cost: 2, strengths: ["stem", "outdoors", "medicine", "business"], note: { en: "Island campus on the coast, strong in marine science, nursing and business.", es: "Campus en una isla en la costa, fuerte en ciencias marinas, enfermería y negocios." }, url: "https://www.tamucc.edu/" },
  { id: "laredo", name: "Laredo College", city: "Laredo, TX", rgv: false, type: "community", cost: 1, strengths: ["trades", "medicine", "business"], note: { en: "Community college on the border with health, technical and transfer programs.", es: "Colegio comunitario en la frontera con programas de salud, técnicos y de transferencia." }, url: "https://www.laredo.edu/" },
  { id: "utsa", name: "University of Texas at San Antonio (UTSA)", city: "San Antonio, TX", rgv: false, type: "public4", cost: 2, strengths: ["coding", "stem", "business", "law"], note: { en: "Large university about 4 hours away, known for cybersecurity and engineering.", es: "Universidad grande a unas 4 horas, conocida por ciberseguridad e ingeniería." }, url: "https://www.utsa.edu/" },
  { id: "txst", name: "Texas State University", city: "San Marcos, TX", rgv: false, type: "public4", cost: 2, strengths: ["teaching", "business", "art", "music", "outdoors"], note: { en: "Large public university between San Antonio and Austin.", es: "Universidad pública grande entre San Antonio y Austin." }, url: "https://www.txst.edu/" },
  { id: "ut", name: "University of Texas at Austin", city: "Austin, TX", rgv: false, type: "public4", cost: 3, strengths: ["stem", "coding", "business", "law", "medicine", "art", "writing"], note: { en: "Highly selective flagship. Has free-tuition programs for many Texas families — check the official site.", es: "Universidad principal muy selectiva. Tiene programas de matrícula gratis para muchas familias de Texas — revisa el sitio oficial." }, url: "https://www.utexas.edu/" },
  { id: "tamu", name: "Texas A&M University", city: "College Station, TX", rgv: false, type: "public4", cost: 3, strengths: ["stem", "agriculture", "animals", "business", "military"], note: { en: "Large flagship with engineering, veterinary medicine, agriculture and the Corps of Cadets.", es: "Universidad principal grande con ingeniería, veterinaria, agricultura y el Cuerpo de Cadetes." }, url: "https://www.tamu.edu/" },
  { id: "uh", name: "University of Houston", city: "Houston, TX", rgv: false, type: "public4", cost: 2, strengths: ["business", "stem", "law", "medicine", "cooking"], note: { en: "Big-city public university with business, engineering, and a hotel & restaurant program.", es: "Universidad pública en una gran ciudad, con negocios, ingeniería y un programa de hotelería y restaurantes." }, url: "https://www.uh.edu/" },
];

// ---------------- Transportation (3.1.10) ----------------
export const TRANSIT = [
  {
    id: "valleymetro",
    name: "Valley Metro (LRGVDC)",
    area: { en: "Hidalgo, Cameron, Willacy, Starr & Zapata counties — connects Valley cities", es: "Condados Hidalgo, Cameron, Willacy, Starr y Zapata — conecta ciudades del Valle" },
    phone: "1-800-574-8322",
    url: "https://www.lrgvdc.org/valleymetro.html",
  },
  { id: "metromcallen", name: "Metro McAllen", area: { en: "Bus routes inside McAllen", es: "Rutas de autobús dentro de McAllen" }, phone: "(956) 681-3510", url: "https://www.mcallen.net/metro/" },
  { id: "bmetro", name: "Brownsville Metro (B Metro)", area: { en: "Bus routes inside Brownsville", es: "Rutas de autobús dentro de Brownsville" }, url: "https://www.brownsvilletx.gov/281/Brownsville-Metro" },
];

export const RIDE_TIPS: Localized[] = [
  { en: "Ask the organizer if they provide transportation or know of a carpool — many programs do.", es: "Pregunta al organizador si da transporte o conoce un aventón compartido — muchos programas lo hacen." },
  { en: "School-sponsored activities often have an activity bus. Ask your coach or sponsor.", es: "Las actividades de la escuela muchas veces tienen autobús. Pregunta a tu entrenador o patrocinador." },
  { en: "Parents can coordinate rides on the Parent carpool board in the People tab.", es: "Los padres pueden organizar aventones en el tablero de aventones de la pestaña Gente." },
  { en: "Turn on Online-only mode in Settings to see things you can do from home.", es: "Activa el modo Solo en línea en Ajustes para ver cosas que puedes hacer desde casa." },
  { en: "Never accept rides from strangers you met online. Tell a parent where you're going.", es: "Nunca aceptes aventones de desconocidos que conociste en internet. Dile a tu mamá o papá a dónde vas." },
];

// ---------------- Seasonal suggestions (3.1.5) ----------------
// month index 0 = January
export const SEASONAL: { months: number[]; emoji: string; title: Localized; why: Localized; query: Localized }[] = [
  { months: [0, 1, 2], emoji: "☀️", title: { en: "Summer programs", es: "Programas de verano" }, why: { en: "Most summer programs take applications January–March.", es: "La mayoría de los programas de verano reciben solicitudes de enero a marzo." }, query: { en: "free summer programs for high school students", es: "programas de verano gratis para estudiantes de prepa" } },
  { months: [0, 1, 2, 3], emoji: "🧑‍💻", title: { en: "Summer internships", es: "Prácticas de verano" }, why: { en: "Summer internship deadlines are often in winter and early spring.", es: "Las fechas para prácticas de verano suelen ser en invierno y principios de primavera." }, query: { en: "summer internships for high school students", es: "prácticas de verano para estudiantes de prepa" } },
  { months: [2, 3, 4], emoji: "💼", title: { en: "Summer jobs", es: "Trabajos de verano" }, why: { en: "Pools, camps, and city programs hire teens in spring.", es: "Albercas, campamentos y programas de la ciudad contratan jóvenes en primavera." }, query: { en: "summer jobs for teens", es: "trabajos de verano para jóvenes" } },
  { months: [3, 4, 5], emoji: "🏕️", title: { en: "Summer camps", es: "Campamentos de verano" }, why: { en: "Camp spots fill up fast in spring — look for free and scholarship spots.", es: "Los lugares en campamentos se llenan en primavera — busca opciones gratis o con beca." }, query: { en: "free summer camps", es: "campamentos de verano gratis" } },
  { months: [5, 6, 7], emoji: "📚", title: { en: "Summer learning & test prep", es: "Aprender en verano y preparación de exámenes" }, why: { en: "Summer is a great time for free courses and SAT/TSI practice.", es: "El verano es ideal para cursos gratis y práctica del SAT/TSI." }, query: { en: "free online summer courses for teens", es: "cursos gratis en línea de verano para jóvenes" } },
  { months: [5, 6, 7], emoji: "🤝", title: { en: "Summer volunteering", es: "Voluntariado de verano" }, why: { en: "Earn service hours while school is out.", es: "Gana horas de servicio mientras no hay clases." }, query: { en: "summer volunteer opportunities for teens", es: "voluntariado de verano para jóvenes" } },
  { months: [8, 9, 10, 11], emoji: "🎓", title: { en: "Scholarships", es: "Becas" }, why: { en: "Fall is scholarship season, and the FAFSA opens around October 1.", es: "El otoño es temporada de becas, y la FAFSA abre alrededor del 1 de octubre." }, query: { en: "scholarships for high school seniors", es: "becas para estudiantes de último año" } },
  { months: [8, 9, 10], emoji: "🏆", title: { en: "Fall competitions", es: "Competencias de otoño" }, why: { en: "Many academic and coding competitions open in the fall.", es: "Muchas competencias académicas y de programación abren en otoño." }, query: { en: "academic competitions for students", es: "competencias académicas para estudiantes" } },
  { months: [10, 11], emoji: "🦃", title: { en: "Holiday volunteering", es: "Voluntariado navideño" }, why: { en: "Food banks and toy drives need extra help in November and December.", es: "Los bancos de comida y colectas de juguetes necesitan ayuda en noviembre y diciembre." }, query: { en: "holiday volunteer food drive toy drive", es: "voluntariado navideño colecta de comida juguetes" } },
  { months: [11, 0], emoji: "❄️", title: { en: "Winter break camps & courses", es: "Campamentos y cursos de vacaciones de invierno" }, why: { en: "Use winter break to learn something new.", es: "Aprovecha las vacaciones de invierno para aprender algo nuevo." }, query: { en: "winter break programs for teens", es: "programas de vacaciones de invierno para jóvenes" } },
];

// ---------------- "Surprise me" ideas (3.1.2) ----------------
export const SURPRISE_QUERIES: Localized[] = [
  { en: "youth court or teen court volunteer", es: "voluntariado en corte juvenil" },
  { en: "astronomy club or star party", es: "club de astronomía" },
  { en: "bird count or nature volunteer", es: "voluntariado de naturaleza o conteo de aves" },
  { en: "mock trial team", es: "equipo de juicio simulado" },
  { en: "game design camp", es: "campamento de diseño de videojuegos" },
  { en: "FFA livestock show", es: "exposición de ganado FFA" },
  { en: "Model United Nations", es: "Modelo de Naciones Unidas" },
  { en: "sea turtle conservation volunteer", es: "voluntariado de conservación de tortugas marinas" },
  { en: "student film festival", es: "festival de cine estudiantil" },
  { en: "mariachi or folklórico program", es: "programa de mariachi o folklórico" },
  { en: "drone or aviation program for teens", es: "programa de drones o aviación para jóvenes" },
  { en: "entrepreneurship challenge for students", es: "reto de emprendimiento para estudiantes" },
  { en: "science fair", es: "feria de ciencias" },
  { en: "poetry slam for teens", es: "competencia de poesía para jóvenes" },
  { en: "library teen advisory board", es: "consejo juvenil de la biblioteca" },
  { en: "cybersecurity capture the flag", es: "competencia de ciberseguridad" },
];

// ---------------- Scholarships everyone should know (3.2.6) ----------------
export const KNOWN_SCHOLARSHIPS: { name: string; who: Localized; when: Localized; url: string; tags: string[] }[] = [
  { name: "TEXAS Grant & state aid (via FAFSA/TASFA)", who: { en: "Texas students with financial need going to a Texas public college", es: "Estudiantes de Texas con necesidad económica que irán a una universidad pública de Texas" }, when: { en: "Texas priority deadline: Jan 15, 2027 (for 2027–28)", es: "Fecha prioritaria de Texas: 15 ene 2027 (para 2027–28)" }, url: "https://www.highered.texas.gov/", tags: ["texas", "need", "first-gen"] },
  { name: "Hispanic Scholarship Fund", who: { en: "Seniors of Hispanic heritage, 3.0+ GPA", es: "Estudiantes de último año de herencia hispana, promedio 3.0+" }, when: { en: "Usually due mid-February", es: "Normalmente a mediados de febrero" }, url: "https://www.hsf.net/scholarship", tags: ["hispanic", "merit"] },
  { name: "Dell Scholars Program", who: { en: "Pell-eligible seniors in a college-readiness program", es: "Estudiantes de último año elegibles para Pell en un programa de preparación universitaria" }, when: { en: "Usually opens in winter", es: "Normalmente abre en invierno" }, url: "https://www.dellscholars.org/", tags: ["need", "first-gen"] },
  { name: "QuestBridge", who: { en: "High-achieving students from low-income families (juniors and seniors)", es: "Estudiantes destacados de familias de bajos ingresos (11.º y 12.º)" }, when: { en: "College Prep Scholars (juniors) in spring; National College Match (seniors) in early fall", es: "College Prep Scholars (11.º) en primavera; National College Match (12.º) a principios de otoño" }, url: "https://www.questbridge.org/", tags: ["need", "merit", "first-gen"] },
  { name: "The Gates Scholarship", who: { en: "High-achieving, Pell-eligible minority seniors", es: "Estudiantes de minorías destacados y elegibles para Pell" }, when: { en: "Usually due in September of senior year", es: "Normalmente en septiembre del último año" }, url: "https://www.thegatesscholarship.org/", tags: ["need", "merit", "hispanic"] },
  { name: "Coca-Cola Scholars Program", who: { en: "Seniors who show leadership and service", es: "Estudiantes de último año con liderazgo y servicio" }, when: { en: "Usually due around Sept 30 of senior year", es: "Normalmente alrededor del 30 de septiembre del último año" }, url: "https://www.coca-colascholarsfoundation.org/", tags: ["merit", "service"] },
  { name: "Jack Kent Cooke College Scholarship", who: { en: "High-achieving seniors with financial need", es: "Estudiantes destacados de último año con necesidad económica" }, when: { en: "Usually due in the fall of senior year", es: "Normalmente en el otoño del último año" }, url: "https://www.jkcf.org/", tags: ["need", "merit"] },
  { name: "Scholastic Art & Writing Awards", who: { en: "Grades 7–12 artists and writers (fee waivers available)", es: "Artistas y escritores de 7.º a 12.º (hay exención de pago)" }, when: { en: "Regional deadlines Dec 1, 2026 – Jan 6, 2027", es: "Fechas regionales del 1 dic 2026 al 6 ene 2027" }, url: "https://www.artandwriting.org/", tags: ["art", "writing", "merit"] },
];

// ---------------- Military & ROTC (3.2.9) ----------------
export const MILITARY_BRANCHES = [
  { name: "Army", url: "https://www.goarmy.com/" },
  { name: "Navy", url: "https://www.navy.com/" },
  { name: "Air Force", url: "https://www.airforce.com/" },
  { name: "Marine Corps", url: "https://www.marines.com/" },
  { name: "Coast Guard", url: "https://www.gocoastguard.com/" },
  { name: "Space Force", url: "https://www.spaceforce.com/" },
];
