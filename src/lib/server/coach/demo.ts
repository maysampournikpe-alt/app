import "server-only";
import type { CoachMode } from "@/types";

// Demo-mode coach: simple scripted replies used when no AI key is set.
// They still follow the same teaching rules (e.g. homework mode never gives answers).

type Msg = { role: "user" | "assistant"; text: string };

const T = (locale: string, en: string, es: string) => (locale === "es" ? es : en);

const INTERVIEW_QS = [
  ["Tell me a little about yourself.", "Cuéntame un poco sobre ti."],
  ["Why are you interested in this opportunity?", "¿Por qué te interesa esta oportunidad?"],
  ["Tell me about a time you faced a challenge. What did you do?", "Cuéntame de una vez que enfrentaste un reto. ¿Qué hiciste?"],
  ["What is one of your strengths, and how have you used it?", "¿Cuál es una de tus fortalezas y cómo la has usado?"],
  ["Tell me about a time you worked on a team.", "Cuéntame de una vez que trabajaste en equipo."],
  ["Do you have any questions for us?", "¿Tienes alguna pregunta para nosotros?"],
];

const QUIZ = [
  { q: ["What is 15% of 80?", "¿Cuánto es el 15% de 80?"], a: ["12"], why: ["10% of 80 is 8 and 5% is 4, so 8 + 4 = 12.", "El 10% de 80 es 8 y el 5% es 4, así que 8 + 4 = 12."] },
  { q: ["What part of the cell makes energy (ATP)?", "¿Qué parte de la célula produce energía (ATP)?"], a: ["mitochondria", "mitochondrion", "mitocondria", "mitocondrias"], why: ["The mitochondria is the cell's power plant.", "La mitocondria es la planta de energía de la célula."] },
  { q: ["Solve for x: 3x + 5 = 20", "Resuelve x: 3x + 5 = 20"], a: ["5", "x=5", "x = 5"], why: ["Subtract 5 to get 3x = 15, then divide by 3.", "Resta 5 para tener 3x = 15 y luego divide entre 3."] },
  { q: ["Which document begins with “We the People”?", "¿Qué documento empieza con “We the People”?"], a: ["constitution", "the constitution", "constitución", "la constitución", "constitucion"], why: ["The U.S. Constitution's preamble starts with those words.", "El preámbulo de la Constitución de EE. UU. empieza así."] },
  { q: ["What gas do plants take in for photosynthesis?", "¿Qué gas absorben las plantas para la fotosíntesis?"], a: ["carbon dioxide", "co2", "dióxido de carbono", "dioxido de carbono"], why: ["Plants use carbon dioxide, water and sunlight to make sugar and oxygen.", "Las plantas usan dióxido de carbono, agua y luz para hacer azúcar y oxígeno."] },
];

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.!?¡¿,]/g, "").trim();
}

export function demoCoachReply(mode: CoachMode, messages: Msg[], locale: string, opp?: { title: string }): string {
  const userMsgs = messages.filter((m) => m.role === "user");
  const last = userMsgs[userMsgs.length - 1]?.text ?? "";
  const turn = messages.filter((m) => m.role === "assistant").length;
  const L = (en: string, es: string) => T(locale, en, es);
  const note = L("\n\n_(Demo coach — connect the AI for full answers.)_", "\n\n_(Coach de demostración — conecta la IA para respuestas completas.)_");

  switch (mode) {
    case "homework":
      if (turn === 0)
        return (
          L(
            `Let's figure this out together — I'll guide you instead of just giving the answer, so it sticks.\n\n1. In your own words, what is the question asking?\n2. What information do you already have?\n3. What have you tried so far?\n\nTell me those and we'll take the first step.`,
            `Vamos a resolverlo juntos — te voy a guiar en vez de darte la respuesta, para que lo aprendas.\n\n1. Con tus palabras, ¿qué pide la pregunta?\n2. ¿Qué datos ya tienes?\n3. ¿Qué has intentado?\n\nDime eso y damos el primer paso.`,
          ) + note
        );
      return (
        L(
          `Good thinking! Here's a hint for the next step: look for the operation or rule that connects what you know to what you need. Try just that one step and tell me what you get — I'll check it with you.\n\nStuck? Tell me which part is confusing and I'll show a similar example with different numbers.`,
          `¡Bien pensado! Una pista para el siguiente paso: busca la operación o regla que conecta lo que sabes con lo que necesitas. Intenta solo ese paso y dime qué te sale — lo revisamos juntos.\n\n¿Atorado? Dime qué parte te confunde y te muestro un ejemplo parecido con otros números.`,
        ) + note
      );
    case "interview": {
      const intro = turn === 0 ? L(`Let's practice${opp ? ` for **${opp.title}**` : ""}! I'll ask one question at a time.\n\n`, `¡Vamos a practicar${opp ? ` para **${opp.title}**` : ""}! Te haré una pregunta a la vez.\n\n`) : "";
      const feedback =
        turn > 0
          ? last.trim().split(/\s+/).length < 25
            ? L("Nice start! Try adding a specific example — what happened, what YOU did, and the result (the STAR method).\n\n", "¡Buen comienzo! Agrega un ejemplo concreto — qué pasó, qué hiciste TÚ y cuál fue el resultado (el método STAR).\n\n")
            : L("Great detail! Next time, finish with the result or what you learned — it makes your answer memorable.\n\n", "¡Muy buen detalle! La próxima vez termina con el resultado o lo que aprendiste — así se recuerda tu respuesta.\n\n")
          : "";
      if (turn >= INTERVIEW_QS.length)
        return feedback + L("That's the end of our practice interview. Your top move: keep using real examples. Practice out loud once more before the real thing — you've got this!", "Ese fue el final de la entrevista de práctica. Tu mejor estrategia: sigue usando ejemplos reales. Practica en voz alta una vez más antes de la de verdad — ¡tú puedes!") + note;
      const q = INTERVIEW_QS[turn];
      return intro + feedback + `**${L("Question", "Pregunta")} ${turn + 1}:** ${L(q[0], q[1])}` + note;
    }
    case "debate":
      if (turn === 0)
        return (
          L(
            `I'm ready to debate! I'll take the **opposite side** of whatever you argue.\n\nGive me your position in one sentence, plus your best reason.`,
            `¡Listo para debatir! Tomaré el **lado contrario** de lo que defiendas.\n\nDame tu postura en una oración y tu mejor razón.`,
          ) + note
        );
      return (
        L(
          `Here's my counter-argument: your point depends on everyone acting the way you expect — but what about the people it doesn't work for? Real policies have trade-offs, like cost and fairness.\n\n**Your turn:** answer my point with evidence or an example. (Coach tip: name my argument, then explain why yours still matters more.)`,
          `Mi contraargumento: tu idea depende de que todos actúen como esperas — ¿y las personas para quienes no funciona? Las decisiones reales tienen costos, como el dinero y la justicia.\n\n**Tu turno:** responde mi punto con evidencia o un ejemplo. (Consejo: nombra mi argumento y explica por qué el tuyo pesa más.)`,
        ) + note
      );
    case "quiz": {
      let out = "";
      if (turn > 0 && turn <= QUIZ.length) {
        const prev = QUIZ[turn - 1];
        const right = prev.a.some((a) => norm(last).includes(norm(a)));
        out += right ? L("✅ Correct! ", "✅ ¡Correcto! ") : L(`❌ Not quite — the answer is **${prev.a[0]}**. `, `❌ Casi — la respuesta es **${prev.a[0]}**. `);
        out += L(prev.why[0], prev.why[1]) + "\n\n";
      } else if (turn === 0) {
        out += L("Quiz time! Here's a mixed warm-up (with the AI connected, you can pick any topic).\n\n", "¡Hora del quiz! Aquí va un calentamiento variado (con la IA conectada puedes elegir cualquier tema).\n\n");
      }
      if (turn >= QUIZ.length) return out + L("That's the end of the warm-up quiz — nice work!", "¡Ese fue el final del quiz — buen trabajo!") + note;
      return out + `**${L("Question", "Pregunta")} ${turn + 1}:** ${L(QUIZ[turn].q[0], QUIZ[turn].q[1])}` + note;
    }
    case "email":
      return (
        L(
          `A strong inquiry email has 5 parts:\n\n1. **Subject:** short and clear ("Question about summer volunteering")\n2. **Greeting:** "Hello Ms. Garcia," or "Hello,"\n3. **Who you are:** first name, grade, school\n4. **Your ask:** one or two sentences — what you'd like to know\n5. **Thank you + your first name**\n\nWrite your draft here and I'll give you tips. (Don't include your address, and have a parent read it if you're under 16.)`,
          `Un buen correo para preguntar tiene 5 partes:\n\n1. **Asunto:** corto y claro ("Pregunta sobre voluntariado de verano")\n2. **Saludo:** "Hola, Sra. García:" o "Hola:"\n3. **Quién eres:** nombre, grado y escuela\n4. **Tu pregunta:** una o dos oraciones\n5. **Gracias + tu nombre**\n\nEscribe tu borrador aquí y te doy consejos. (No pongas tu dirección, y pide a tu mamá o papá que lo lea si tienes menos de 16.)`,
        ) + note
      );
    case "essay":
      return (
        L(
          `Paste your essay and I'll give feedback (without rewriting it). I'll look at:\n\n- **Main idea:** can a reader say it in one sentence?\n- **Structure:** does each paragraph do one job?\n- **Evidence:** specific examples and details\n- **Voice:** does it sound like you?\n- **Grammar patterns** that repeat`,
          `Pega tu ensayo y te doy comentarios (sin reescribirlo). Voy a revisar:\n\n- **Idea principal:** ¿se puede decir en una oración?\n- **Estructura:** ¿cada párrafo tiene un propósito?\n- **Evidencia:** ejemplos y detalles concretos\n- **Voz:** ¿suena a ti?\n- **Errores de gramática** que se repiten`,
        ) + note
      );
    case "language":
      return turn === 0
        ? L("Let's practice! Do you want to practice **English** or **Spanish**? Tell me about your weekend in that language.", "¡Vamos a practicar! ¿Quieres practicar **inglés** o **español**? Cuéntame de tu fin de semana en ese idioma.") + note
        : L("Nice! Here's a tip: try using a past-tense verb to describe what you did. What was the best part of your week?", "¡Muy bien! Un consejo: usa un verbo en pasado para contar lo que hiciste. ¿Qué fue lo mejor de tu semana?") + note;
    default: {
      const q = norm(last);
      if (/chess|ajedrez/.test(q))
        return L("Chess tips that win games:\n\n1. **Control the center** early (e4, d4, Nf3).\n2. **Develop** knights and bishops before moving the queen.\n3. **Castle** early to keep your king safe.\n4. Before each move ask: *what is my opponent threatening?*\n5. Do 10 tactics puzzles a day (try the Daily Challenge in Coach → Practice).", "Consejos de ajedrez que ganan partidas:\n\n1. **Controla el centro** (e4, d4, Cf3).\n2. **Desarrolla** caballos y alfiles antes de sacar la dama.\n3. **Enroca** pronto para proteger al rey.\n4. Antes de cada jugada pregúntate: *¿qué amenaza mi rival?*\n5. Haz 10 problemas tácticos al día (prueba el Reto diario en Coach → Práctica).") + note;
      if (/medic|doctor|nurs|medicina|enfermer/.test(q))
        return L("Path to medical school, step by step:\n\n1. **Now:** strong grades in biology, chemistry and math; take AP or dual credit science if you can.\n2. **Get experience:** hospital volunteering, CPR certification, shadowing a doctor.\n3. **Show you care:** community service, especially health-related.\n4. **College:** any major works, but complete pre-med courses and study for the MCAT.\n\nWant me to turn this into a plan? Try the Plan tab!", "El camino a la escuela de medicina, paso a paso:\n\n1. **Ahora:** buenas calificaciones en biología, química y matemáticas; toma ciencias AP o de doble crédito si puedes.\n2. **Experiencia:** voluntariado en hospital, certificación de RCP, observar a un doctor.\n3. **Demuestra que te importa:** servicio comunitario, sobre todo de salud.\n4. **Universidad:** cualquier carrera sirve, pero toma los cursos pre-med y estudia para el MCAT.\n\n¿Quieres un plan? ¡Prueba la pestaña Plan!") + note;
      if (/college|universi|application|solicitud|fafsa/.test(q))
        return L("College application checklist:\n\n1. Make a list of 5–8 colleges (include UTRGV, South Texas College, and a few reach schools).\n2. Ask 2 teachers for recommendations early.\n3. Write your essay about a real moment that shows who you are.\n4. Fill out the FAFSA (opens Oct 1) and apply for scholarships.\n5. Use ApplyTexas or the Common App and track deadlines in Plan → Calendar.", "Lista para solicitar a la universidad:\n\n1. Haz una lista de 5–8 universidades (incluye UTRGV, South Texas College y algunas difíciles).\n2. Pide cartas de recomendación a 2 maestros con tiempo.\n3. Escribe tu ensayo sobre un momento real que muestre quién eres.\n4. Llena la FAFSA (abre el 1 de octubre) y aplica a becas.\n5. Usa ApplyTexas o la Common App y anota fechas en Plan → Calendario.") + note;
      return L(
        `Great question! I'm in demo mode right now, so my answers are limited. Here's how I can help:\n\n- **Homework** mode teaches step by step\n- **Interview**, **Debate** and **Quiz** modes let you practice\n- Ask me about chess, college, or medical school for tips\n\nWhat's one goal you're working on this month?`,
        `¡Buena pregunta! Ahora estoy en modo demo, así que mis respuestas son limitadas. Así te puedo ayudar:\n\n- El modo **Tarea** enseña paso a paso\n- Los modos **Entrevista**, **Debate** y **Quiz** te dejan practicar\n- Pregúntame de ajedrez, universidad o medicina para consejos\n\n¿Qué meta tienes este mes?`,
      ) + note;
    }
  }
}
