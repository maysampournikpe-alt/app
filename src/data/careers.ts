// Career explorer data (3.2.1). Pay is the approximate U.S. median yearly pay from the
// U.S. Bureau of Labor Statistics (BLS) Occupational Outlook Handbook (May 2024 data),
// rounded. Pay in the Rio Grande Valley is often lower — each career links to
// CareerOneStop (U.S. Dept. of Labor), which shows Texas pay and a day-in-the-life video.
import type { Localized } from "@/i18n/config";

/** Holland interest codes used by the interest quiz. */
export type Riasec = "R" | "I" | "A" | "S" | "E" | "C";

export interface Career {
  id: string;
  emoji: string;
  title: Localized;
  /** O*NET / CareerOneStop occupation name for the profile link */
  onet: string;
  codes: Riasec[];
  pay: number; // U.S. median per year, USD (approx.)
  payNote?: Localized;
  education: Localized;
  years: Localized; // training time after high school
  day: Localized; // typical day
  startNow: Localized; // what a student can do now
  search: Localized; // Find tab search
}

export const CAREERS: Career[] = [
  {
    id: "rn", emoji: "🩺", onet: "Registered Nurses", codes: ["S", "I"], pay: 93600,
    title: { en: "Registered Nurse", es: "Enfermero(a) registrado(a)" },
    education: { en: "Associate or bachelor's degree in nursing + state license (NCLEX)", es: "Título técnico o licenciatura en enfermería + licencia estatal (NCLEX)" },
    years: { en: "2–4 years", es: "2–4 años" },
    day: { en: "Check on patients, give medicines, explain care to families, work with doctors. Often 12-hour shifts in hospitals or clinics.", es: "Revisas pacientes, das medicinas, explicas el cuidado a las familias y trabajas con doctores. A veces turnos de 12 horas en hospitales o clínicas." },
    startNow: { en: "Take biology and health science, get CPR certified, volunteer at a hospital, join HOSA.", es: "Toma biología y ciencias de la salud, saca tu certificado de RCP, sé voluntario en un hospital, únete a HOSA." },
    search: { en: "hospital volunteer for teens", es: "voluntariado en hospital para jóvenes" },
  },
  {
    id: "physician", emoji: "👩‍⚕️", onet: "Family Medicine Physicians", codes: ["I", "S"], pay: 239200,
    payNote: { en: "$239,200 or more", es: "$239,200 o más" },
    title: { en: "Doctor (Physician)", es: "Doctor(a) / Médico(a)" },
    education: { en: "Bachelor's degree + 4 years medical school + 3–7 years residency", es: "Licenciatura + 4 años de escuela de medicina + 3–7 años de residencia" },
    years: { en: "11–15 years", es: "11–15 años" },
    day: { en: "Examine patients, figure out what's wrong, order tests, and create treatment plans.", es: "Examinas pacientes, descubres qué tienen, pides estudios y haces planes de tratamiento." },
    startNow: { en: "Strong science grades, health volunteering, shadow a doctor, summer science programs.", es: "Buenas notas en ciencias, voluntariado de salud, observar a un doctor, programas de ciencias en verano." },
    search: { en: "pre-med summer program for high school students", es: "programa de verano pre-medicina para preparatoria" },
  },
  {
    id: "cna", emoji: "🤲", onet: "Nursing Assistants", codes: ["S", "R"], pay: 39530,
    title: { en: "Certified Nursing Assistant (CNA)", es: "Asistente de enfermería certificado(a) (CNA)" },
    education: { en: "Short certificate program + state exam (some high schools offer it)", es: "Programa corto de certificado + examen estatal (algunas prepas lo ofrecen)" },
    years: { en: "A few weeks to a few months", es: "De unas semanas a unos meses" },
    day: { en: "Help patients eat, move, and stay clean and comfortable; take vital signs.", es: "Ayudas a pacientes a comer, moverse y estar limpios y cómodos; tomas signos vitales." },
    startNow: { en: "Ask about CNA classes in your high school's health science program.", es: "Pregunta por clases de CNA en el programa de ciencias de la salud de tu prepa." },
    search: { en: "CNA certification for high school students", es: "certificación CNA para estudiantes de prepa" },
  },
  {
    id: "dentalhyg", emoji: "🦷", onet: "Dental Hygienists", codes: ["S", "R"], pay: 94260,
    title: { en: "Dental Hygienist", es: "Higienista dental" },
    education: { en: "Associate degree in dental hygiene + license", es: "Título técnico en higiene dental + licencia" },
    years: { en: "About 3 years", es: "Unos 3 años" },
    day: { en: "Clean teeth, take X-rays, and teach patients how to care for their teeth.", es: "Limpias dientes, tomas radiografías y enseñas a los pacientes a cuidar sus dientes." },
    startNow: { en: "Biology and chemistry, shadow at a dental office.", es: "Biología y química, observa en un consultorio dental." },
    search: { en: "dental office volunteer or shadowing for teens", es: "observar en consultorio dental para jóvenes" },
  },
  {
    id: "pharmacist", emoji: "💊", onet: "Pharmacists", codes: ["I", "C"], pay: 137480,
    title: { en: "Pharmacist", es: "Farmacéutico(a)" },
    education: { en: "Doctor of Pharmacy (Pharm.D.) + license", es: "Doctorado en Farmacia (Pharm.D.) + licencia" },
    years: { en: "6–8 years", es: "6–8 años" },
    day: { en: "Check prescriptions, make sure medicines are safe together, and answer patients' questions.", es: "Revisas recetas, verificas que las medicinas sean seguras juntas y respondes preguntas de pacientes." },
    startNow: { en: "Chemistry and math; a pharmacy technician job after 18 is a great start.", es: "Química y matemáticas; un trabajo de técnico de farmacia después de los 18 es buen comienzo." },
    search: { en: "pharmacy careers for high school students", es: "carreras de farmacia para estudiantes de prepa" },
  },
  {
    id: "pt", emoji: "🏃", onet: "Physical Therapists", codes: ["S", "I", "R"], pay: 101020,
    title: { en: "Physical Therapist", es: "Fisioterapeuta" },
    education: { en: "Doctor of Physical Therapy (DPT) + license", es: "Doctorado en Fisioterapia (DPT) + licencia" },
    years: { en: "About 7 years", es: "Unos 7 años" },
    day: { en: "Help people recover from injuries with exercises and stretches.", es: "Ayudas a personas a recuperarse de lesiones con ejercicios y estiramientos." },
    startNow: { en: "Sports medicine or athletic trainer helper at school, anatomy, volunteering.", es: "Ayudante de entrenador atlético en la escuela, anatomía, voluntariado." },
    search: { en: "sports medicine program for high school students", es: "programa de medicina deportiva para prepa" },
  },
  {
    id: "vet", emoji: "🐶", onet: "Veterinarians", codes: ["I", "R"], pay: 125510,
    title: { en: "Veterinarian", es: "Veterinario(a)" },
    education: { en: "Bachelor's degree + 4 years veterinary school (DVM) + license", es: "Licenciatura + 4 años de veterinaria (DVM) + licencia" },
    years: { en: "About 8 years", es: "Unos 8 años" },
    day: { en: "Examine and treat pets or farm animals, do surgery, and help owners care for animals.", es: "Examinas y curas mascotas o animales de granja, haces cirugías y ayudas a los dueños." },
    startNow: { en: "Volunteer at an animal shelter, join 4-H or FFA, take biology.", es: "Sé voluntario en un refugio de animales, únete a 4-H o FFA, toma biología." },
    search: { en: "animal shelter volunteer for teens", es: "voluntariado en refugio de animales para jóvenes" },
  },
  {
    id: "software", emoji: "💻", onet: "Software Developers", codes: ["I", "C", "A"], pay: 133080,
    title: { en: "Software Developer", es: "Desarrollador(a) de software" },
    education: { en: "Usually a bachelor's in computer science; some start with bootcamps and a strong portfolio", es: "Normalmente licenciatura en informática; algunos empiezan con bootcamps y un buen portafolio" },
    years: { en: "2–4 years", es: "2–4 años" },
    day: { en: "Plan, write, and test code for apps and websites, often working on a team.", es: "Planeas, escribes y pruebas código para apps y sitios web, muchas veces en equipo." },
    startNow: { en: "Free courses (CS50, Code.org), build small projects, enter the Congressional App Challenge.", es: "Cursos gratis (CS50, Code.org), crea proyectos pequeños, entra al Congressional App Challenge." },
    search: { en: "free coding camps for teens", es: "campamentos gratis de programación para jóvenes" },
  },
  {
    id: "cyber", emoji: "🛡️", onet: "Information Security Analysts", codes: ["I", "C"], pay: 124910,
    title: { en: "Cybersecurity Analyst", es: "Analista de ciberseguridad" },
    education: { en: "Bachelor's degree in computer science or cybersecurity; certifications help", es: "Licenciatura en informática o ciberseguridad; las certificaciones ayudan" },
    years: { en: "2–4 years", es: "2–4 años" },
    day: { en: "Protect computer systems from hackers, watch for attacks, and fix weak spots.", es: "Proteges sistemas de los hackers, vigilas ataques y arreglas puntos débiles." },
    startNow: { en: "Try CyberPatriot or picoCTF competitions, learn networking basics.", es: "Prueba competencias como CyberPatriot o picoCTF, aprende redes básicas." },
    search: { en: "cybersecurity competition for high school", es: "competencia de ciberseguridad para prepa" },
  },
  {
    id: "civileng", emoji: "🌉", onet: "Civil Engineers", codes: ["R", "I"], pay: 99590,
    title: { en: "Civil Engineer", es: "Ingeniero(a) civil" },
    education: { en: "Bachelor's degree in civil engineering (license later)", es: "Licenciatura en ingeniería civil (licencia después)" },
    years: { en: "4 years", es: "4 años" },
    day: { en: "Design roads, bridges, water systems, and buildings and make sure they're safe.", es: "Diseñas calles, puentes, sistemas de agua y edificios, y verificas que sean seguros." },
    startNow: { en: "Physics and math, robotics or engineering club, UIL science.", es: "Física y matemáticas, club de robótica o ingeniería, ciencias de UIL." },
    search: { en: "engineering summer camp for high school", es: "campamento de ingeniería de verano para prepa" },
  },
  {
    id: "electrician", emoji: "⚡", onet: "Electricians", codes: ["R", "C"], pay: 62350,
    title: { en: "Electrician", es: "Electricista" },
    education: { en: "Apprenticeship or technical program + license", es: "Aprendizaje (apprenticeship) o programa técnico + licencia" },
    years: { en: "4–5 years (paid while you learn)", es: "4–5 años (con pago mientras aprendes)" },
    day: { en: "Install and fix wiring, lights, and power systems in homes and businesses.", es: "Instalas y reparas cables, luces y sistemas eléctricos en casas y negocios." },
    startNow: { en: "Career and technical (CTE) classes, math, ask about apprenticeships.", es: "Clases técnicas (CTE), matemáticas, pregunta por programas de aprendizaje." },
    search: { en: "electrician apprenticeship program Texas", es: "programa de aprendiz de electricista Texas" },
  },
  {
    id: "welder", emoji: "🔥", onet: "Welders, Cutters, Solderers, and Brazers", codes: ["R"], pay: 51000,
    title: { en: "Welder", es: "Soldador(a)" },
    education: { en: "Technical certificate (high school CTE, community college, or TSTC)", es: "Certificado técnico (CTE en prepa, colegio comunitario o TSTC)" },
    years: { en: "Months to 2 years", es: "Meses a 2 años" },
    day: { en: "Join metal parts for buildings, pipelines, ships, and machines.", es: "Unes piezas de metal para edificios, tuberías, barcos y máquinas." },
    startNow: { en: "Take welding or ag mechanics classes; compete in SkillsUSA.", es: "Toma clases de soldadura o mecánica agrícola; compite en SkillsUSA." },
    search: { en: "welding certification for high school students", es: "certificación de soldadura para estudiantes de prepa" },
  },
  {
    id: "hvac", emoji: "❄️", onet: "Heating, Air Conditioning, and Refrigeration Mechanics and Installers", codes: ["R", "C"], pay: 59810,
    title: { en: "HVAC Technician", es: "Técnico(a) de aire acondicionado (HVAC)" },
    education: { en: "Technical certificate or apprenticeship; EPA certification", es: "Certificado técnico o aprendizaje; certificación EPA" },
    years: { en: "6 months to 2 years", es: "6 meses a 2 años" },
    day: { en: "Install and repair air conditioners and heaters — in the Valley, AC is always needed!", es: "Instalas y reparas aires acondicionados y calefacción — ¡en el Valle siempre se necesita el aire!" },
    startNow: { en: "CTE classes, math, ask about HVAC programs at TSTC or STC.", es: "Clases técnicas, matemáticas, pregunta por programas de HVAC en TSTC o STC." },
    search: { en: "HVAC training program Rio Grande Valley", es: "programa de HVAC Valle del Río Grande" },
  },
  {
    id: "autotech", emoji: "🚗", onet: "Automotive Service Technicians and Mechanics", codes: ["R", "I"], pay: 49670,
    title: { en: "Automotive Technician", es: "Técnico(a) automotriz" },
    education: { en: "Technical program + ASE certifications", es: "Programa técnico + certificaciones ASE" },
    years: { en: "1–2 years", es: "1–2 años" },
    day: { en: "Find out what's wrong with cars using computers and tools, then fix them.", es: "Descubres qué falla en los carros con computadoras y herramientas, y los reparas." },
    startNow: { en: "Auto tech classes, SkillsUSA, help in a family member's shop.", es: "Clases de mecánica, SkillsUSA, ayuda en el taller de un familiar." },
    search: { en: "auto mechanic class for teens", es: "clase de mecánica automotriz para jóvenes" },
  },
  {
    id: "teacher", emoji: "🍎", onet: "High School Teachers", codes: ["S", "A"], pay: 65220,
    title: { en: "Teacher", es: "Maestro(a)" },
    education: { en: "Bachelor's degree + Texas teacher certification", es: "Licenciatura + certificación de maestro en Texas" },
    years: { en: "4 years", es: "4 años" },
    day: { en: "Plan lessons, teach, help students who are stuck, and grade work.", es: "Planeas clases, enseñas, ayudas a quien se atora y calificas tareas." },
    startNow: { en: "Tutor younger kids, Education & Training CTE classes, camp counselor.", es: "Da tutorías a niños menores, clases técnicas de educación, consejero de campamento." },
    search: { en: "tutoring volunteer for teens", es: "voluntariado de tutorías para jóvenes" },
  },
  {
    id: "lawyer", emoji: "⚖️", onet: "Lawyers", codes: ["E", "I"], pay: 151160,
    title: { en: "Lawyer", es: "Abogado(a)" },
    education: { en: "Bachelor's degree + 3 years law school + bar exam", es: "Licenciatura + 3 años de escuela de derecho + examen de la barra" },
    years: { en: "7 years", es: "7 años" },
    day: { en: "Research laws, write documents, give advice, and speak for clients in court.", es: "Investigas leyes, escribes documentos, das consejos y representas clientes en la corte." },
    startNow: { en: "Debate, mock trial, Model UN, write well, observe a court hearing.", es: "Debate, juicio simulado, Modelo ONU, escribe bien, observa una audiencia." },
    search: { en: "mock trial or law program for high school students", es: "juicio simulado o programa de leyes para prepa" },
  },
  {
    id: "paralegal", emoji: "📂", onet: "Paralegals and Legal Assistants", codes: ["C", "E"], pay: 61010,
    title: { en: "Paralegal", es: "Asistente legal (paralegal)" },
    education: { en: "Associate degree or certificate in paralegal studies", es: "Título técnico o certificado en estudios paralegales" },
    years: { en: "1–2 years", es: "1–2 años" },
    day: { en: "Help lawyers research, organize files, and prepare documents. Bilingual paralegals are in demand.", es: "Ayudas a abogados a investigar, organizar expedientes y preparar documentos. Se buscan paralegales bilingües." },
    startNow: { en: "Strong reading and writing, office skills, law-related volunteering.", es: "Buena lectura y escritura, habilidades de oficina, voluntariado relacionado con leyes." },
    search: { en: "law office internship for high school students", es: "práctica en despacho legal para prepa" },
  },
  {
    id: "accountant", emoji: "📊", onet: "Accountants and Auditors", codes: ["C", "E"], pay: 81680,
    title: { en: "Accountant", es: "Contador(a)" },
    education: { en: "Bachelor's degree in accounting (CPA license later)", es: "Licenciatura en contabilidad (licencia CPA después)" },
    years: { en: "4–5 years", es: "4–5 años" },
    day: { en: "Keep track of money for businesses and families, prepare taxes, and spot problems.", es: "Llevas las cuentas de negocios y familias, preparas impuestos y encuentras errores." },
    startNow: { en: "Math, business classes, FBLA or DECA, help with a family business's books.", es: "Matemáticas, clases de negocios, FBLA o DECA, ayuda con las cuentas de un negocio familiar." },
    search: { en: "business competition FBLA DECA", es: "competencia de negocios FBLA DECA" },
  },
  {
    id: "designer", emoji: "🎨", onet: "Graphic Designers", codes: ["A", "E"], pay: 61300,
    title: { en: "Graphic Designer", es: "Diseñador(a) gráfico(a)" },
    education: { en: "Bachelor's degree often, but a strong portfolio matters most", es: "Muchas veces licenciatura, pero lo más importante es un buen portafolio" },
    years: { en: "2–4 years", es: "2–4 años" },
    day: { en: "Design logos, posters, websites, and social media graphics for clients.", es: "Diseñas logos, carteles, páginas web y gráficos para redes sociales." },
    startNow: { en: "Art classes, free design tools, enter the Scholastic Art & Writing Awards.", es: "Clases de arte, herramientas gratis de diseño, entra a los premios Scholastic de arte." },
    search: { en: "art and design competition for teens", es: "concurso de arte y diseño para jóvenes" },
  },
  {
    id: "socialworker", emoji: "🤝", onet: "Child, Family, and School Social Workers", codes: ["S", "E"], pay: 61330,
    title: { en: "Social Worker", es: "Trabajador(a) social" },
    education: { en: "Bachelor's or master's in social work + license", es: "Licenciatura o maestría en trabajo social + licencia" },
    years: { en: "4–6 years", es: "4–6 años" },
    day: { en: "Help families find food, housing, health care, and support during hard times.", es: "Ayudas a familias a encontrar comida, vivienda, salud y apoyo en tiempos difíciles." },
    startNow: { en: "Volunteer with food banks or community groups; being bilingual is a big plus.", es: "Sé voluntario en bancos de comida o grupos comunitarios; ser bilingüe ayuda mucho." },
    search: { en: "community service volunteer for teens", es: "voluntariado comunitario para jóvenes" },
  },
  {
    id: "police", emoji: "🚓", onet: "Police and Sheriff's Patrol Officers", codes: ["R", "S", "E"], pay: 76550,
    title: { en: "Police Officer", es: "Policía" },
    education: { en: "High school diploma + police academy (some agencies want college)", es: "Diploma de prepa + academia de policía (algunas piden universidad)" },
    years: { en: "About 6 months academy", es: "Unos 6 meses de academia" },
    day: { en: "Patrol neighborhoods, respond to calls, help people, and write reports.", es: "Patrullas colonias, respondes llamadas, ayudas a la gente y escribes reportes." },
    startNow: { en: "Law enforcement CTE, Police Explorers programs, stay out of trouble, stay fit.", es: "Clases técnicas de policía, programas Police Explorers, evita problemas y mantente en forma." },
    search: { en: "police explorer program for teens", es: "programa de exploradores de policía para jóvenes" },
  },
  {
    id: "trucker", emoji: "🚚", onet: "Heavy and Tractor-Trailer Truck Drivers", codes: ["R"], pay: 57440,
    title: { en: "Truck Driver", es: "Chofer de tráiler" },
    education: { en: "Commercial driver's license (CDL) training; interstate driving at 21+", es: "Entrenamiento para licencia comercial (CDL); viajes entre estados desde los 21" },
    years: { en: "A few weeks to a few months", es: "De unas semanas a unos meses" },
    day: { en: "Move goods across Texas and the border — a big industry in the Valley.", es: "Transportas mercancía por Texas y la frontera — una industria grande en el Valle." },
    startNow: { en: "Keep a clean driving record and learn basic vehicle maintenance.", es: "Mantén un buen historial al manejar y aprende mantenimiento básico." },
    search: { en: "logistics careers Rio Grande Valley", es: "carreras en logística Valle del Río Grande" },
  },
];

/** Descriptions of the six interest types for the quiz results. */
export const RIASEC_INFO: Record<Riasec, { emoji: string; name: Localized; desc: Localized }> = {
  R: { emoji: "🔧", name: { en: "Builder (Realistic)", es: "Constructor (Realista)" }, desc: { en: "You like hands-on work with tools, machines, animals, or the outdoors.", es: "Te gusta el trabajo práctico con herramientas, máquinas, animales o al aire libre." } },
  I: { emoji: "🔬", name: { en: "Thinker (Investigative)", es: "Pensador (Investigador)" }, desc: { en: "You like figuring things out, science, math, and solving puzzles.", es: "Te gusta descubrir cosas, la ciencia, las matemáticas y resolver acertijos." } },
  A: { emoji: "🎨", name: { en: "Creator (Artistic)", es: "Creador (Artístico)" }, desc: { en: "You like creating — art, music, writing, design, or performing.", es: "Te gusta crear — arte, música, escritura, diseño o actuar." } },
  S: { emoji: "🤝", name: { en: "Helper (Social)", es: "Ayudante (Social)" }, desc: { en: "You like helping, teaching, and caring for people.", es: "Te gusta ayudar, enseñar y cuidar a la gente." } },
  E: { emoji: "🚀", name: { en: "Leader (Enterprising)", es: "Líder (Emprendedor)" }, desc: { en: "You like leading, persuading, selling, and starting things.", es: "Te gusta dirigir, convencer, vender y empezar proyectos." } },
  C: { emoji: "🗂️", name: { en: "Organizer (Conventional)", es: "Organizador (Convencional)" }, desc: { en: "You like organizing, numbers, details, and clear plans.", es: "Te gusta organizar, los números, los detalles y los planes claros." } },
};

export const QUIZ_QUESTIONS: { code: Riasec; q: Localized }[] = [
  { code: "R", q: { en: "Fix a bike, a phone, or something broken", es: "Arreglar una bici, un teléfono o algo descompuesto" } },
  { code: "I", q: { en: "Do a science experiment to find out why something happens", es: "Hacer un experimento para saber por qué pasa algo" } },
  { code: "A", q: { en: "Draw, make music, write stories, or edit videos", es: "Dibujar, hacer música, escribir historias o editar videos" } },
  { code: "S", q: { en: "Help a friend understand their homework", es: "Ayudar a un amigo a entender su tarea" } },
  { code: "E", q: { en: "Lead a team or convince people to join your idea", es: "Dirigir un equipo o convencer a otros de tu idea" } },
  { code: "C", q: { en: "Organize a schedule, a budget, or a messy closet", es: "Organizar un horario, un presupuesto o un clóset desordenado" } },
  { code: "R", q: { en: "Build things with your hands or work outdoors", es: "Construir cosas con las manos o trabajar al aire libre" } },
  { code: "I", q: { en: "Solve hard math problems or logic puzzles", es: "Resolver problemas difíciles de matemáticas o lógica" } },
  { code: "A", q: { en: "Design how something looks, like a room or a poster", es: "Diseñar cómo se ve algo, como un cuarto o un cartel" } },
  { code: "S", q: { en: "Volunteer to care for kids, older people, or animals", es: "Ser voluntario cuidando niños, personas mayores o animales" } },
  { code: "E", q: { en: "Start a small business or sell something", es: "Empezar un negocio pequeño o vender algo" } },
  { code: "C", q: { en: "Keep careful records or check work for mistakes", es: "Llevar registros con cuidado o revisar errores" } },
];

/** CareerOneStop (U.S. Dept. of Labor) profile: Texas pay, education, and a day-in-the-life video. */
export function careerProfileUrl(c: Career) {
  return `https://www.careeronestop.org/Toolkit/Careers/Occupations/occupation-profile.aspx?keyword=${encodeURIComponent(c.onet)}&location=TX`;
}
