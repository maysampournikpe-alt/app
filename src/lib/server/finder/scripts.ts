// Sample email and phone scripts students can use to ask a place about opportunities.
// The student fills in the [brackets]. We never put their personal info in.

export function contactScripts(locale: string, place: string, topic: string, grade?: number, city?: string) {
  const g = grade ? (locale === "es" ? `${grade}.º grado` : `${grade}th-grade`) : locale === "es" ? "de preparatoria" : "high school";
  if (locale === "es") {
    return {
      email:
        `Asunto: Pregunta sobre oportunidades de ${topic} para estudiantes\n\n` +
        `Hola:\n\nMe llamo [tu nombre] y soy estudiante de ${g} en [tu escuela]${city ? ` en ${city}` : ""}. ` +
        `Me interesa mucho ${topic} y quería preguntar si ${place} tiene oportunidades de voluntariado, pasantía u observación para estudiantes.\n\n` +
        `Estoy disponible [días y horas]. ¿Hay algún requisito de edad o algún formulario que deba llenar?\n\n` +
        `¡Muchas gracias por su tiempo!\n[tu nombre]\n[correo de tu mamá, papá o tutor si tienes menos de 16]`,
      phone:
        `“Hola, buenos días. Me llamo [tu nombre] y soy estudiante de ${g}. Me interesa ${topic} y quería saber si ${place} acepta estudiantes como voluntarios o para observar el trabajo. ` +
        `¿Con quién podría hablar sobre eso?” \n\n(Si dicen que sí: pregunta la edad mínima, los horarios y cómo aplicar. Al final: “¡Muchas gracias por su ayuda!”)`,
    };
  }
  return {
    email:
      `Subject: Question about ${topic} opportunities for students\n\n` +
      `Hello,\n\nMy name is [your first name], and I'm a ${g} student at [your school]${city ? ` in ${city}` : ""}. ` +
      `I'm really interested in ${topic}, and I wanted to ask if ${place} has any volunteer, internship, or job-shadowing opportunities for students.\n\n` +
      `I'm available [days and times]. Is there a minimum age or a form I should fill out?\n\n` +
      `Thank you so much for your time!\n[your first name]\n[a parent's or guardian's email, if you're under 16]`,
    phone:
      `"Hi, my name is [your first name], and I'm a ${g} student. I'm interested in ${topic}, and I wanted to ask if ${place} takes students as volunteers or for job shadowing. ` +
      `Who would be the best person to talk to about that?"\n\n(If they say yes: ask about the minimum age, the schedule, and how to apply. End with: "Thank you so much for your help!")`,
  };
}
