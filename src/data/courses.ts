// Free courses and learning sites (Phase 4.1), matched to interests and goals.
import type { Localized } from "@/i18n/config";

export interface Course {
  name: string;
  url: string;
  what: Localized;
  tags: string[]; // interest ids + extra keywords
  spanish?: boolean;
}

export const COURSES: Course[] = [
  { name: "Khan Academy", url: "https://www.khanacademy.org/", what: { en: "Free lessons in math, science, computing, economics and more.", es: "Lecciones gratis de matemáticas, ciencias, computación, economía y más." }, tags: ["math", "stem", "medicine", "coding", "business", "tests"], spanish: true },
  { name: "Official Digital SAT Prep (Khan Academy)", url: "https://www.khanacademy.org/digital-sat", what: { en: "Free official SAT practice made with the College Board.", es: "Práctica oficial gratis del SAT hecha con College Board." }, tags: ["tests", "college", "math", "writing"] },
  { name: "Code.org", url: "https://code.org/", what: { en: "Free beginner coding courses, games and the Hour of Code.", es: "Cursos gratis de programación para principiantes, juegos y la Hora del Código." }, tags: ["coding", "stem", "gaming"], spanish: true },
  { name: "Harvard CS50x", url: "https://cs50.harvard.edu/x/", what: { en: "Harvard's intro to computer science, free online.", es: "Introducción a la informática de Harvard, gratis en línea." }, tags: ["coding", "stem"] },
  { name: "freeCodeCamp", url: "https://www.freecodecamp.org/", what: { en: "Learn web development and earn free certifications.", es: "Aprende desarrollo web y gana certificaciones gratis." }, tags: ["coding", "business"], spanish: true },
  { name: "Scratch", url: "https://scratch.mit.edu/", what: { en: "Make games and animations with block coding (great for beginners).", es: "Haz juegos y animaciones con programación por bloques (ideal para empezar)." }, tags: ["coding", "art", "gaming"], spanish: true },
  { name: "GCFGlobal", url: "https://edu.gcfglobal.org/", what: { en: "Free tutorials for Word, Excel, Google tools, email and job skills.", es: "Tutoriales gratis de Word, Excel, herramientas de Google, correo y habilidades laborales." }, tags: ["business", "community", "trades", "skills"], spanish: true },
  { name: "Google Applied Digital Skills", url: "https://applieddigitalskills.withgoogle.com/", what: { en: "Free project-based lessons on digital skills, resumes and more.", es: "Lecciones gratis por proyectos sobre habilidades digitales, currículum y más." }, tags: ["business", "coding", "skills"] },
  { name: "Lichess Learn", url: "https://lichess.org/learn", what: { en: "Free interactive chess lessons and puzzles.", es: "Lecciones y problemas de ajedrez interactivos y gratis." }, tags: ["chess"] },
  { name: "Duolingo", url: "https://www.duolingo.com/", what: { en: "Practice English, Spanish and many more languages for free.", es: "Practica inglés, español y muchos idiomas más gratis." }, tags: ["languages"], spanish: true },
  { name: "musictheory.net", url: "https://www.musictheory.net/", what: { en: "Free lessons and exercises for reading music and ear training.", es: "Lecciones y ejercicios gratis para leer música y entrenar el oído." }, tags: ["music"] },
  { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", what: { en: "Free MIT course materials, including videos and problem sets.", es: "Materiales gratis de cursos de MIT, con videos y ejercicios." }, tags: ["stem", "math", "coding"] },
  { name: "Crash Course (YouTube)", url: "https://www.youtube.com/@crashcourse", what: { en: "Fun video courses on history, biology, psychology, government and more.", es: "Cursos en video divertidos de historia, biología, psicología, gobierno y más." }, tags: ["medicine", "law", "writing", "stem", "community"] },
  { name: "Typing.com", url: "https://www.typing.com/", what: { en: "Free typing lessons — a skill every job and class needs.", es: "Lecciones gratis de mecanografía — una habilidad que todo trabajo y clase necesita." }, tags: ["skills", "business", "coding"], spanish: true },
];
