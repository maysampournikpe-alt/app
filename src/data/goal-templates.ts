// Ready-made goal plans (1.3.6). Written by hand in English and Spanish, so they
// cost $0, work offline, and work in demo mode. The AI can still adjust them.
import type { Localized } from "@/i18n/config";
import type { Horizon } from "@/types";

export interface TemplateStep {
  h: Horizon;
  t: Localized;
  d?: Localized;
  /** A search for the Find tab that helps with this step */
  q?: Localized;
}

export interface GoalTemplate {
  id: string;
  emoji: string;
  title: Localized;
  summary: Localized;
  match: RegExp; // used to pick a template in demo mode
  steps: TemplateStep[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "college",
    emoji: "🎓",
    title: { en: "Apply to college", es: "Solicitar a la universidad" },
    summary: {
      en: "Build a strong application step by step, find money for college, and hit every deadline.",
      es: "Arma una buena solicitud paso a paso, encuentra dinero para la universidad y cumple cada fecha límite.",
    },
    match: /\b(college|universit|apply|application|solicitud|universidad)\b/i,
    steps: [
      { h: "week", t: { en: "Make a list of 5–8 colleges you like", es: "Haz una lista de 5–8 universidades que te gusten" }, d: { en: "Include nearby options like UTRGV and South Texas College, plus a few “reach” schools.", es: "Incluye opciones cercanas como UTRGV y South Texas College, y algunas más difíciles." }, q: { en: "college open house visit days", es: "días de visita universidad" } },
      { h: "week", t: { en: "Write down your activities, awards and volunteer hours", es: "Anota tus actividades, premios y horas de voluntariado" }, d: { en: "Use Me → Tracker so your resume is ready later.", es: "Usa Yo → Registro para tener tu currículum listo después." } },
      { h: "week", t: { en: "Talk to your counselor about your plan", es: "Habla con tu consejero sobre tu plan" } },
      { h: "month", t: { en: "Take or schedule the SAT, ACT or TSI", es: "Toma o programa el SAT, ACT o TSI" }, d: { en: "Ask your counselor about fee waivers — many students qualify.", es: "Pregunta a tu consejero por exenciones de pago — muchos califican." }, q: { en: "SAT fee waiver free test prep", es: "exención de pago SAT preparación gratis" } },
      { h: "month", t: { en: "Ask two teachers for recommendation letters", es: "Pide cartas de recomendación a dos maestros" }, d: { en: "Ask at least a month before the deadline and give them your resume.", es: "Pide al menos un mes antes y dales tu currículum." } },
      { h: "month", t: { en: "Draft your college essay", es: "Escribe el borrador de tu ensayo" }, d: { en: "Write about a real moment that shows who you are. Get feedback in Coach → Essay feedback.", es: "Escribe sobre un momento real que muestre quién eres. Pide comentarios en Coach → Revisar ensayo." } },
      { h: "month", t: { en: "Fill out the FAFSA or TASFA", es: "Llena la FAFSA o la TASFA" }, d: { en: "It opens October 1. Do it with a parent — it's free.", es: "Abre el 1 de octubre. Hazla con tu mamá o papá — es gratis." }, q: { en: "FAFSA help night", es: "taller FAFSA" } },
      { h: "year", t: { en: "Apply for at least 5 scholarships", es: "Aplica a por lo menos 5 becas" }, q: { en: "scholarships for high school seniors", es: "becas para estudiantes de último año" } },
      { h: "year", t: { en: "Submit applications (ApplyTexas or Common App)", es: "Envía tus solicitudes (ApplyTexas o Common App)" } },
      { h: "year", t: { en: "Compare financial aid offers and choose your college", es: "Compara las ofertas de ayuda financiera y elige tu universidad" } },
    ],
  },
  {
    id: "medschool",
    emoji: "🩺",
    title: { en: "Get into medical school", es: "Entrar a la escuela de medicina" },
    summary: {
      en: "A long road, started early: strong science grades, real health-care experience, and service.",
      es: "Un camino largo que se empieza temprano: buenas notas en ciencias, experiencia real en salud y servicio.",
    },
    match: /\b(medic|doctor|physician|med school|nurs|medicina|m[eé]dic)\w*/i,
    steps: [
      { h: "week", t: { en: "Check your class schedule for biology, chemistry and math", es: "Revisa que tu horario tenga biología, química y matemáticas" }, d: { en: "Ask about AP or dual credit science.", es: "Pregunta por ciencias AP o de doble crédito." } },
      { h: "week", t: { en: "Watch a “day in the life” video of a doctor", es: "Mira un video de “un día en la vida” de un doctor" } },
      { h: "week", t: { en: "Start a study routine for your hardest science class", es: "Empieza una rutina de estudio para tu clase de ciencias más difícil" } },
      { h: "month", t: { en: "Get CPR / First Aid certified", es: "Obtén tu certificación de RCP / primeros auxilios" }, q: { en: "CPR certification class for teens", es: "clase de RCP para adolescentes" } },
      { h: "month", t: { en: "Find a health-related volunteer role", es: "Busca un voluntariado relacionado con la salud" }, q: { en: "hospital volunteer program for teens", es: "voluntariado en hospital para jóvenes" } },
      { h: "month", t: { en: "Join HOSA or a health science club", es: "Únete a HOSA o a un club de ciencias de la salud" }, q: { en: "HOSA future health professionals chapter", es: "club HOSA profesionales de la salud" } },
      { h: "year", t: { en: "Apply to a summer health or science program", es: "Aplica a un programa de verano de salud o ciencias" }, q: { en: "free summer medical programs for high school students", es: "programas de verano de medicina gratis para estudiantes de prepa" } },
      { h: "year", t: { en: "Shadow a doctor or health professional", es: "Observa a un doctor o profesional de la salud" } },
      { h: "year", t: { en: "Keep a log of service hours and what you learned", es: "Lleva un registro de horas de servicio y lo que aprendiste" } },
    ],
  },
  {
    id: "chess",
    emoji: "♟️",
    title: { en: "Prepare for the state chess championship", es: "Prepararme para el campeonato estatal de ajedrez" },
    summary: {
      en: "Train tactics every day, play rated games, and learn from every loss.",
      es: "Entrena táctica todos los días, juega partidas con rating y aprende de cada derrota.",
    },
    match: /\b(chess|ajedrez)\b/i,
    steps: [
      { h: "week", t: { en: "Solve 10 tactics puzzles a day", es: "Resuelve 10 problemas tácticos al día" }, d: { en: "Try the Daily Challenge in Coach → Practice.", es: "Prueba el Reto diario en Coach → Práctica." } },
      { h: "week", t: { en: "Pick one opening for White and one for Black", es: "Escoge una apertura para blancas y una para negras" } },
      { h: "week", t: { en: "Analyze one of your games and find your biggest mistake", es: "Analiza una de tus partidas y encuentra tu error más grande" } },
      { h: "month", t: { en: "Play in a local or online rated tournament", es: "Juega un torneo local o en línea con rating" }, q: { en: "scholastic chess tournament", es: "torneo de ajedrez escolar" } },
      { h: "month", t: { en: "Study basic endgames (king and pawn, rook endings)", es: "Estudia finales básicos (rey y peón, torres)" } },
      { h: "month", t: { en: "Join or start a school chess club", es: "Únete o empieza un club de ajedrez en la escuela" } },
      { h: "year", t: { en: "Register for the Texas Scholastic Championship", es: "Inscríbete al Campeonato Escolar de Texas" }, q: { en: "Texas scholastic chess championship", es: "campeonato escolar de ajedrez Texas" } },
      { h: "year", t: { en: "Practice long games to build focus", es: "Practica partidas largas para mejorar tu concentración" } },
    ],
  },
  {
    id: "firstjob",
    emoji: "💼",
    title: { en: "Get my first job", es: "Conseguir mi primer trabajo" },
    summary: {
      en: "Get ready, apply smart, and ace the interview — and stay safe from job scams.",
      es: "Prepárate, aplica con estrategia y luce en la entrevista — y cuídate de las estafas.",
    },
    match: /\b(job|work|empleo|trabajo|chamba)\b/i,
    steps: [
      { h: "week", t: { en: "Make a simple one-page resume", es: "Haz un currículum sencillo de una página" }, d: { en: "Use Me → Resume. Include school, activities, volunteering and skills.", es: "Usa Yo → Currículum. Incluye escuela, actividades, voluntariado y habilidades." } },
      { h: "week", t: { en: "Ask two adults to be your references", es: "Pide a dos adultos que sean tus referencias" }, d: { en: "A teacher, coach or volunteer supervisor works great.", es: "Un maestro, entrenador o supervisor de voluntariado funciona muy bien." } },
      { h: "week", t: { en: "Learn the signs of a job scam", es: "Aprende las señales de una estafa de trabajo" }, d: { en: "Real jobs never ask you to pay to start.", es: "Los trabajos de verdad nunca te piden pagar para empezar." } },
      { h: "month", t: { en: "Apply to at least 5 places", es: "Aplica a por lo menos 5 lugares" }, q: { en: "jobs for teens near me", es: "trabajos para jóvenes cerca de mí" } },
      { h: "month", t: { en: "Practice an interview with the Coach", es: "Practica una entrevista con el Coach" } },
      { h: "month", t: { en: "Follow up politely a week after applying", es: "Haz seguimiento con cortesía una semana después de aplicar" } },
      { h: "year", t: { en: "Open a savings account with a parent", es: "Abre una cuenta de ahorros con tu mamá o papá" }, d: { en: "Track earnings in Plan → Budget.", es: "Lleva tus ganancias en Plan → Presupuesto." } },
      { h: "year", t: { en: "Ask for a reference letter when you leave", es: "Pide una carta de referencia cuando te vayas" } },
    ],
  },
  {
    id: "eagle",
    emoji: "🦅",
    title: { en: "Become an Eagle Scout", es: "Convertirme en Eagle Scout" },
    summary: {
      en: "Earn your merit badges, lead in your troop, and complete a service project before age 18.",
      es: "Gana tus insignias de mérito, sé líder en tu tropa y completa un proyecto de servicio antes de los 18.",
    },
    match: /\b(eagle|scout)\w*/i,
    steps: [
      { h: "week", t: { en: "Check your Scoutbook progress with your Scoutmaster", es: "Revisa tu progreso en Scoutbook con tu Scoutmaster" } },
      { h: "week", t: { en: "Pick your next Eagle-required merit badge", es: "Escoge tu siguiente insignia obligatoria para Eagle" } },
      { h: "month", t: { en: "Finish one merit badge with a counselor", es: "Termina una insignia con un consejero" } },
      { h: "month", t: { en: "Take a leadership position in your troop", es: "Toma un puesto de liderazgo en tu tropa" } },
      { h: "month", t: { en: "Brainstorm service project ideas that help your community", es: "Piensa ideas de proyecto de servicio que ayuden a tu comunidad" }, q: { en: "community service project ideas nonprofit partner", es: "ideas de proyecto de servicio comunitario" } },
      { h: "year", t: { en: "Get your Eagle project proposal approved", es: "Consigue la aprobación de tu propuesta de proyecto Eagle" } },
      { h: "year", t: { en: "Lead your project and log all volunteer hours", es: "Dirige tu proyecto y registra todas las horas" } },
      { h: "year", t: { en: "Complete your application and board of review before your 18th birthday", es: "Completa tu solicitud y tu junta de revisión antes de cumplir 18" } },
    ],
  },
  {
    id: "varsity",
    emoji: "⚽",
    title: { en: "Make the varsity team", es: "Entrar al equipo varsity" },
    summary: {
      en: "Get stronger, sharpen your skills, and show coaches you're coachable.",
      es: "Ponte más fuerte, mejora tus habilidades y demuestra a los entrenadores que sabes escuchar.",
    },
    match: /\b(varsity|team|soccer|football|basketball|baseball|volleyball|track|equipo|f[uú]tbol|b[aá]squet|voleibol)\b/i,
    steps: [
      { h: "week", t: { en: "Ask the coach what they look for in varsity players", es: "Pregunta al entrenador qué busca en los jugadores varsity" } },
      { h: "week", t: { en: "Do 3 conditioning workouts this week", es: "Haz 3 entrenamientos físicos esta semana" } },
      { h: "week", t: { en: "Practice your weakest skill for 20 minutes a day", es: "Practica tu habilidad más débil 20 minutos al día" } },
      { h: "month", t: { en: "Join an off-season league or open gym", es: "Únete a una liga o práctica libre fuera de temporada" }, q: { en: "youth sports league", es: "liga deportiva juvenil" } },
      { h: "month", t: { en: "Watch game film and take notes", es: "Mira videos de partidos y toma notas" } },
      { h: "month", t: { en: "Keep your grades up so you stay eligible", es: "Mantén tus calificaciones para seguir siendo elegible" } },
      { h: "year", t: { en: "Attend a summer camp or clinic", es: "Asiste a un campamento o clínica de verano" }, q: { en: "summer sports camp", es: "campamento deportivo de verano" } },
      { h: "year", t: { en: "Try out with confidence — and ask for feedback either way", es: "Haz la prueba con confianza — y pide consejos pase lo que pase" } },
    ],
  },
  {
    id: "debate",
    emoji: "🎤",
    title: { en: "Win a debate tournament", es: "Ganar un torneo de debate" },
    summary: {
      en: "Research both sides, practice speaking, and learn from every round.",
      es: "Investiga ambos lados, practica hablar en público y aprende de cada ronda.",
    },
    match: /\b(debate|speech|oratoria|public speaking)\b/i,
    steps: [
      { h: "week", t: { en: "Learn your event's format and time limits", es: "Aprende el formato y los tiempos de tu evento" } },
      { h: "week", t: { en: "Practice a round against the Coach in Debate mode", es: "Practica una ronda contra el Coach en modo Debate" } },
      { h: "week", t: { en: "Write a one-page case for the current topic", es: "Escribe un caso de una página sobre el tema actual" } },
      { h: "month", t: { en: "Research evidence for BOTH sides", es: "Investiga evidencia para AMBOS lados" } },
      { h: "month", t: { en: "Record a speech and check your pace with the Speaking coach", es: "Graba un discurso y revisa tu ritmo con el Coach de oratoria" } },
      { h: "month", t: { en: "Compete in a local tournament", es: "Compite en un torneo local" }, q: { en: "high school debate tournament", es: "torneo de debate de preparatoria" } },
      { h: "year", t: { en: "Ask judges for feedback and track your ballots", es: "Pide comentarios a los jueces y revisa tus resultados" } },
      { h: "year", t: { en: "Qualify for UIL or state", es: "Califica a UIL o al estatal" } },
    ],
  },
  {
    id: "code",
    emoji: "💻",
    title: { en: "Learn to code and build an app", es: "Aprender a programar y crear una app" },
    summary: {
      en: "Learn the basics for free, build something real, and enter a competition.",
      es: "Aprende lo básico gratis, crea algo real y entra a una competencia.",
    },
    match: /\b(code|coding|program|app|software|programar|programaci[oó]n)\w*/i,
    steps: [
      { h: "week", t: { en: "Start a free course (Code.org, CS50 or Khan Academy)", es: "Empieza un curso gratis (Code.org, CS50 o Khan Academy)" }, q: { en: "free coding course for teens", es: "curso de programación gratis para jóvenes" } },
      { h: "week", t: { en: "Code 30 minutes a day, 4 days this week", es: "Programa 30 minutos al día, 4 días esta semana" } },
      { h: "month", t: { en: "Finish your first small project (a game or quiz)", es: "Termina tu primer proyecto pequeño (un juego o quiz)" } },
      { h: "month", t: { en: "Join a coding club or find a teammate", es: "Únete a un club de programación o busca compañero" }, q: { en: "coding club for teens", es: "club de programación para jóvenes" } },
      { h: "month", t: { en: "Pick a problem in your community your app could solve", es: "Escoge un problema de tu comunidad que tu app pueda resolver" } },
      { h: "year", t: { en: "Build and test your app with real users", es: "Construye y prueba tu app con usuarios reales" } },
      { h: "year", t: { en: "Enter the Congressional App Challenge or a hackathon", es: "Participa en el Congressional App Challenge o un hackatón" }, q: { en: "coding competition for high school", es: "competencia de programación para preparatoria" } },
    ],
  },
];
