import "server-only";
import type { PrismaClient } from "@prisma/client";

/**
 * Demo data so judges and testers can try the school features right away.
 * Everything here is clearly marked as a demo (the school is called "Demo High School").
 *
 * Codes (change them with environment variables for a real school):
 *   students: DEMO_STUDENT_CODE (default RGV-STUDENT)
 *   staff:    DEMO_STAFF_CODE   (default RGV-STAFF)
 *   parents:  DEMO_PARENT_CODE  (default RGV-PARENT)
 *   mentors:  DEMO_MENTOR_CODE  (default RGV-MENTOR)
 */
export const DEMO_CODES = {
  student: process.env.DEMO_STUDENT_CODE ?? "RGV-STUDENT",
  staff: process.env.DEMO_STAFF_CODE ?? "RGV-STAFF",
  parent: process.env.DEMO_PARENT_CODE ?? "RGV-PARENT",
  mentor: process.env.DEMO_MENTOR_CODE ?? "RGV-MENTOR",
};

const OPEN_GROUPS: {
  kind: string;
  slug: string;
  name: string;
  nameEs: string;
  description: string;
  descEs: string;
  subject?: string;
}[] = [
  { kind: "study", slug: "study-algebra", subject: "math", name: "Algebra & Geometry", nameEs: "Álgebra y geometría", description: "Help each other with math homework. Explain steps — don't just post answers.", descEs: "Ayúdense con la tarea de matemáticas. Expliquen los pasos — no solo las respuestas." },
  { kind: "study", slug: "study-biology", subject: "science", name: "Biology & Chemistry", nameEs: "Biología y química", description: "Labs, vocab, and test prep for science classes.", descEs: "Laboratorios, vocabulario y repaso para ciencias." },
  { kind: "study", slug: "study-english", subject: "english", name: "English & Writing", nameEs: "Inglés y escritura", description: "Essays, reading, and grammar. Great for English learners too.", descEs: "Ensayos, lectura y gramática. También para quienes aprenden inglés." },
  { kind: "study", slug: "study-tests", subject: "tests", name: "SAT, PSAT & TSI prep", nameEs: "Preparación SAT, PSAT y TSI", description: "Study tips and practice question talk.", descEs: "Consejos de estudio y preguntas de práctica." },
  { kind: "study", slug: "study-cs", subject: "cs", name: "Computer Science", nameEs: "Informática", description: "Coding questions, projects, and AP CS help.", descEs: "Preguntas de programación, proyectos y ayuda con AP CS." },
  { kind: "team", slug: "teams-robotics-apps", name: "Robotics & App teams", nameEs: "Equipos de robótica y apps", description: "Looking for teammates for robotics, hackathons, or the Congressional App Challenge? Post what you need.", descEs: "¿Buscas compañeros para robótica, hackatones o el Congressional App Challenge? Publica lo que necesitas." },
  { kind: "team", slug: "teams-academic", name: "Academic competition teams", nameEs: "Equipos de competencias académicas", description: "UIL, Science Olympiad, MATHCOUNTS, debate, quiz bowl and more.", descEs: "UIL, Science Olympiad, MATHCOUNTS, debate, quiz bowl y más." },
  { kind: "mentor", slug: "mentor-college", name: "Ask a college student", nameEs: "Pregúntale a un universitario", description: "Verified college students answer questions about college life, applications, and majors.", descEs: "Universitarios verificados responden preguntas sobre la vida universitaria, solicitudes y carreras." },
  { kind: "mentor", slug: "mentor-careers", name: "Careers Q&A", nameEs: "Preguntas sobre carreras", description: "Verified professionals answer questions about their jobs.", descEs: "Profesionales verificados responden preguntas sobre su trabajo." },
];

export async function seedDemoData(db: PrismaClient) {
  const existing = await db.school.findUnique({ where: { studentCode: DEMO_CODES.student } });
  if (existing) {
    await ensureGroups(db, existing.id);
    return;
  }

  const school = await db.school.create({
    data: {
      name: "Demo High School",
      city: "Edinburg, TX",
      studentCode: DEMO_CODES.student,
      staffCode: DEMO_CODES.staff,
      parentCode: DEMO_CODES.parent,
      mentorCode: DEMO_CODES.mentor,
    },
  });

  // School-only spaces
  await db.group.create({
    data: {
      schoolId: school.id,
      kind: "school",
      slug: `school-${school.id}`,
      name: "Demo High School — student group",
      nameEs: "Demo High School — grupo de estudiantes",
      description: "Announcements and questions for students at this school. Moderated by staff.",
      descEs: "Anuncios y preguntas para estudiantes de esta escuela. Moderado por el personal.",
    },
  });
  await db.group.create({
    data: {
      schoolId: school.id,
      kind: "carpool",
      slug: `carpool-${school.id}`,
      name: "Parent carpool board",
      nameEs: "Tablero de aventones para padres",
      description: "Parents only: coordinate rides to events. Meet at the school, never share home addresses here.",
      descEs: "Solo padres: organicen aventones a eventos. Quedan en la escuela, nunca compartan direcciones aquí.",
    },
  });

  await ensureGroups(db, school.id);

  // A few demo posts so the spaces don't look empty (clearly labeled "Demo").
  const algebra = await db.group.findUnique({ where: { slug: "study-algebra" } });
  const teams = await db.group.findUnique({ where: { slug: "teams-robotics-apps" } });
  const mentor = await db.group.findUnique({ where: { slug: "mentor-college" } });
  if (algebra) {
    await db.post.create({
      data: { groupId: algebra.id, deviceHash: "demo", nickname: "Demo student", kind: "question", body: "How do I know when to use the quadratic formula instead of factoring?" },
    });
  }
  if (teams) {
    await db.post.create({
      data: {
        groupId: teams.id,
        deviceHash: "demo",
        nickname: "Demo student",
        kind: "team",
        body: "Looking for 1–2 teammates for the Congressional App Challenge. I can code; need someone who likes design or making videos.",
        meta: JSON.stringify({ needs: ["design", "video"], competition: "Congressional App Challenge" }),
      },
    });
  }
  if (mentor) {
    const q = await db.post.create({
      data: { groupId: mentor.id, deviceHash: "demo", nickname: "Demo student", kind: "question", body: "Is it hard to go to college while living at home?" },
    });
    await db.post.create({
      data: {
        groupId: mentor.id,
        parentId: q.id,
        deviceHash: "demo-mentor",
        nickname: "Demo mentor (college junior)",
        role: "mentor",
        kind: "answer",
        body: "It can actually help! You save money and have family support. Tips: block study time at the library, join one club so you meet people, and use your college's free tutoring center.",
      },
    });
  }

  const clubs = [
    { name: "Robotics Club", description: "Build and program robots for competitions.", meets: "Tue & Thu after school, Room 214", sponsor: "Mr. R (Engineering)" },
    { name: "Chess Club", description: "All levels welcome. We go to local and state tournaments.", meets: "Wednesdays at lunch, Library", sponsor: "Ms. L (Math)" },
    { name: "UIL Academics", description: "Practice for UIL academic events like Number Sense, Spelling, and Science.", meets: "Mondays after school", sponsor: "Mrs. G (Science)" },
    { name: "Debate & Speech", description: "Learn to argue a case, speak with confidence, and compete.", meets: "Fridays after school, Room 105", sponsor: "Mr. T (English)" },
    { name: "Key Club", description: "Volunteer in the community and earn service hours.", meets: "Every other Tuesday at lunch", sponsor: "Ms. P (Counseling)" },
    { name: "Mariachi", description: "Perform at school and community events.", meets: "Daily, 7th period", sponsor: "Mr. V (Fine Arts)" },
  ];
  for (const c of clubs) await db.club.create({ data: { ...c, schoolId: school.id } });

  // One verified staff post that shows up in search for "volunteer"/"food".
  const opp = {
    id: "staff-demo-food-drive",
    title: "Campus food drive volunteers (Demo)",
    organization: "Demo High School Counseling Office",
    description: "Help sort and pack donated food for local families. Counts toward service hours. Sign up with Ms. P in the counseling office.",
    category: "volunteer",
    cost: { type: "free" },
    grades: { min: 9, max: 12 },
    dateText: "Saturdays in November, 9am–12pm",
    mode: "in_person",
    city: "Edinburg",
    carFree: "unknown",
    source: "staff",
    verified: true,
    staffName: "Ms. P (Counselor)",
  };
  await db.staffPost.create({
    data: {
      schoolId: school.id,
      staffName: "Ms. P (Counselor)",
      oppJson: JSON.stringify(opp),
      keywords: "volunteer food drive service hours community help sort pack voluntario comida",
      category: "volunteer",
    },
  });
  await db.recommendation.create({
    data: {
      schoolId: school.id,
      staffName: "Ms. P (Counselor)",
      note: "Great for anyone who needs service hours for NHS or scholarships!",
      oppJson: JSON.stringify(opp),
    },
  });
}

/**
 * Groups added in later versions are created here, so older databases get them too.
 * Safe to run every time the server starts.
 */
async function ensureGroups(db: PrismaClient, schoolId: string) {
  await ensureLeaderboardDemo(db, schoolId);
  for (const g of OPEN_GROUPS) {
    await db.group.upsert({ where: { slug: g.slug }, create: g, update: {} });
  }
  const alumniSlug = `alumni-${schoolId}`;
  const alumni = await db.group.findUnique({ where: { slug: alumniSlug } });
  if (!alumni) {
    const g = await db.group.create({
      data: {
        schoolId,
        kind: "alumni",
        slug: alumniSlug,
        name: "Alumni stories",
        nameEs: "Historias de exalumnos",
        description: "Graduates share what happened after high school. Posted by school staff.",
        descEs: "Exalumnos cuentan qué pasó después de la prepa. Publicado por el personal escolar.",
      },
    });
    const stories = [
      "SAMPLE STORY (made up to show how this works): I took dual credit at STC in 11th and 12th grade and started at UTRGV with a semester of credits already done. My advice: ask your counselor about dual credit early, and use the free tutoring center.",
      "SAMPLE STORY (made up to show how this works): I wasn't sure about college, so I did a welding certificate at TSTC after graduation. Now I work full-time and my company is paying for more training. Trades are a real path!",
    ];
    for (const body of stories) {
      await db.post.create({ data: { groupId: g.id, deviceHash: "demo-staff", nickname: "Ms. P (Counselor)", role: "staff", kind: "story", body } });
    }
  }
}

/**
 * Sample numbers for the school volunteer leaderboard (9.4) so it isn't empty in the demo.
 * Two extra demo schools (clearly named "Demo …") get made-up totals for the current month.
 * Only school totals are ever shown.
 */
async function ensureLeaderboardDemo(db: PrismaClient, demoSchoolId: string) {
  const month = new Date().toISOString().slice(0, 7);
  const demos = [
    { name: "Demo Early College High School", city: "Pharr, TX", key: "DEMO-ECHS", hours: [12, 8.5, 20] },
    { name: "Demo Middle School", city: "McAllen, TX", key: "DEMO-MS", hours: [6, 4] },
  ];
  for (const d of demos) {
    const school = await db.school.upsert({
      where: { studentCode: `${d.key}-STUDENT` },
      create: { name: d.name, city: d.city, studentCode: `${d.key}-STUDENT`, staffCode: `${d.key}-STAFF-${Math.random().toString(36).slice(2, 10)}`, parentCode: `${d.key}-PARENT-${Math.random().toString(36).slice(2, 10)}`, mentorCode: `${d.key}-MENTOR-${Math.random().toString(36).slice(2, 10)}` },
      update: {},
    });
    await seedHours(db, school.id, month, d.hours);
  }
  await seedHours(db, demoSchoolId, month, [10, 7, 5.5]);
}

async function seedHours(db: PrismaClient, schoolId: string, month: string, hours: number[]) {
  for (const [i, h] of hours.entries()) {
    const deviceHash = `demo-${i}`;
    await db.hoursContribution.upsert({ where: { schoolId_deviceHash_month: { schoolId, deviceHash, month } }, create: { schoolId, deviceHash, month, hours: h }, update: {} });
  }
}
