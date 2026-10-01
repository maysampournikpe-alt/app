// Daily challenge content (Phase 4.2). One challenge per day, rotating:
// chess puzzle → math problem → vocabulary word → debate prompt.
// Every chess puzzle was checked with the chess.js engine: each has exactly one mate in 1.
import type { Localized } from "@/i18n/config";

export interface ChessPuzzle {
  fen: string;
  solution: string; // SAN, for showing the answer
  hint: Localized;
}

export const CHESS_PUZZLES: ChessPuzzle[] = [
  { fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", solution: "Rd8#", hint: { en: "Back-rank mate: the king is trapped by its own pawns.", es: "Mate del pasillo: el rey está atrapado por sus propios peones." } },
  { fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1", solution: "Qxf7#", hint: { en: "Two of your pieces attack the same weak square next to the king.", es: "Dos de tus piezas atacan la misma casilla débil junto al rey." } },
  { fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1", solution: "Nf7#", hint: { en: "Smothered mate: the king is boxed in by its own pieces.", es: "Mate ahogado: el rey está encerrado por sus propias piezas." } },
  { fen: "7k/8/5K2/8/8/8/8/6Q1 w - - 0 1", solution: "Qg7#", hint: { en: "Your king can protect your queen right next to the enemy king.", es: "Tu rey puede proteger a tu dama justo al lado del rey enemigo." } },
  { fen: "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1", solution: "Rd1#", hint: { en: "Black to move. White's king has no escape squares on its back rank.", es: "Juegan negras. El rey blanco no tiene escape en su primera fila." } },
  { fen: "7k/1R6/5N2/8/8/8/8/6K1 w - - 0 1", solution: "Rh7#", hint: { en: "Arabian mate: rook and knight work together in the corner.", es: "Mate árabe: torre y caballo trabajan juntos en la esquina." } },
  { fen: "k7/8/1K6/8/8/8/8/7R w - - 0 1", solution: "Rh8#", hint: { en: "Your king already guards the squares in front of the enemy king.", es: "Tu rey ya cuida las casillas frente al rey enemigo." } },
  { fen: "6K1/8/5k2/8/8/8/8/6q1 b - - 0 1", solution: "Qg7#", hint: { en: "Black to move. Bring the queen next to the king, protected by your own king.", es: "Juegan negras. Acerca la dama al rey, protegida por tu propio rey." } },
  { fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2", solution: "Qh4#", hint: { en: "Black to move. The fastest checkmate in chess!", es: "Juegan negras. ¡El jaque mate más rápido del ajedrez!" } },
  { fen: "4k3/R7/4K3/8/8/8/8/8 w - - 0 1", solution: "Ra8#", hint: { en: "The kings face each other — use the rook on the edge.", es: "Los reyes están frente a frente — usa la torre en la orilla." } },
  { fen: "5rk1/6pp/8/5N2/8/8/8/6QK w - - 0 1", solution: "Qxg7#", hint: { en: "The knight protects a square right next to the king.", es: "El caballo protege una casilla junto al rey." } },
  { fen: "1q4k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", solution: "Qb1#", hint: { en: "Black to move. Look at White's back rank.", es: "Juegan negras. Mira la primera fila de las blancas." } },
];

export interface MathProblem {
  q: Localized;
  answer: number;
  explain: Localized;
}

export const MATH_PROBLEMS: MathProblem[] = [
  { q: { en: "Solve for x: 3x + 7 = 22", es: "Resuelve x: 3x + 7 = 22" }, answer: 5, explain: { en: "Subtract 7: 3x = 15. Divide by 3: x = 5.", es: "Resta 7: 3x = 15. Divide entre 3: x = 5." } },
  { q: { en: "What is 25% of 64?", es: "¿Cuánto es el 25% de 64?" }, answer: 16, explain: { en: "25% is one fourth. 64 ÷ 4 = 16.", es: "El 25% es un cuarto. 64 ÷ 4 = 16." } },
  { q: { en: "What is the slope of the line through (1, 2) and (4, 11)?", es: "¿Cuál es la pendiente de la recta que pasa por (1, 2) y (4, 11)?" }, answer: 3, explain: { en: "(11 − 2) ÷ (4 − 1) = 9 ÷ 3 = 3.", es: "(11 − 2) ÷ (4 − 1) = 9 ÷ 3 = 3." } },
  { q: { en: "A triangle has base 10 and height 7. What is its area?", es: "Un triángulo tiene base 10 y altura 7. ¿Cuál es su área?" }, answer: 35, explain: { en: "Area = ½ × base × height = ½ × 10 × 7 = 35.", es: "Área = ½ × base × altura = ½ × 10 × 7 = 35." } },
  { q: { en: "Solve for x: 2(x − 4) = 18", es: "Resuelve x: 2(x − 4) = 18" }, answer: 13, explain: { en: "Divide by 2: x − 4 = 9, so x = 13.", es: "Divide entre 2: x − 4 = 9, así que x = 13." } },
  { q: { en: "What is the average of 82, 90, 75 and 93?", es: "¿Cuál es el promedio de 82, 90, 75 y 93?" }, answer: 85, explain: { en: "Sum = 340. 340 ÷ 4 = 85.", es: "Suma = 340. 340 ÷ 4 = 85." } },
  { q: { en: "A $40 shirt is 30% off. What is the sale price in dollars?", es: "Una camisa de $40 tiene 30% de descuento. ¿Cuál es el precio final en dólares?" }, answer: 28, explain: { en: "30% of 40 is 12. 40 − 12 = 28.", es: "El 30% de 40 es 12. 40 − 12 = 28." } },
  { q: { en: "What is √144 + 3²?", es: "¿Cuánto es √144 + 3²?" }, answer: 21, explain: { en: "√144 = 12 and 3² = 9. 12 + 9 = 21.", es: "√144 = 12 y 3² = 9. 12 + 9 = 21." } },
  { q: { en: "A rectangle is 8 by 5. What is its perimeter?", es: "Un rectángulo mide 8 por 5. ¿Cuál es su perímetro?" }, answer: 26, explain: { en: "2 × (8 + 5) = 26.", es: "2 × (8 + 5) = 26." } },
  { q: { en: "What is 5! ÷ 3! ?", es: "¿Cuánto es 5! ÷ 3! ?" }, answer: 20, explain: { en: "5! = 120 and 3! = 6. 120 ÷ 6 = 20 (or just 5 × 4).", es: "5! = 120 y 3! = 6. 120 ÷ 6 = 20 (o simplemente 5 × 4)." } },
  { q: { en: "If f(x) = 2x² − 3, what is f(3)?", es: "Si f(x) = 2x² − 3, ¿cuánto es f(3)?" }, answer: 15, explain: { en: "2 × 9 − 3 = 15.", es: "2 × 9 − 3 = 15." } },
  { q: { en: "x² = 49 and x is positive. What is x?", es: "x² = 49 y x es positivo. ¿Cuánto vale x?" }, answer: 7, explain: { en: "7 × 7 = 49.", es: "7 × 7 = 49." } },
  { q: { en: "The ratio of boys to girls is 3:5. There are 40 students. How many are girls?", es: "La razón de niños a niñas es 3:5. Hay 40 estudiantes. ¿Cuántas son niñas?" }, answer: 25, explain: { en: "3 + 5 = 8 parts. 40 ÷ 8 = 5 per part. Girls = 5 × 5 = 25.", es: "3 + 5 = 8 partes. 40 ÷ 8 = 5 por parte. Niñas = 5 × 5 = 25." } },
  { q: { en: "You read 40 pages per hour for 1.5 hours. How many pages?", es: "Lees 40 páginas por hora durante 1.5 horas. ¿Cuántas páginas?" }, answer: 60, explain: { en: "40 × 1.5 = 60.", es: "40 × 1.5 = 60." } },
  { q: { en: "A car drives 150 miles in 2.5 hours. What is its average speed in mph?", es: "Un carro recorre 150 millas en 2.5 horas. ¿Cuál es su velocidad promedio en mph?" }, answer: 60, explain: { en: "150 ÷ 2.5 = 60.", es: "150 ÷ 2.5 = 60." } },
  { q: { en: "What is 7 × 8 − 6 ÷ 2?", es: "¿Cuánto es 7 × 8 − 6 ÷ 2?" }, answer: 53, explain: { en: "Multiply and divide first: 56 − 3 = 53.", es: "Primero multiplica y divide: 56 − 3 = 53." } },
  { q: { en: "Simple interest on $500 at 4% per year for 3 years, in dollars?", es: "Interés simple de $500 al 4% anual por 3 años, en dólares?" }, answer: 60, explain: { en: "500 × 0.04 × 3 = 60.", es: "500 × 0.04 × 3 = 60." } },
  { q: { en: "What comes next: 2, 6, 18, 54, …?", es: "¿Qué sigue: 2, 6, 18, 54, …?" }, answer: 162, explain: { en: "Each number is multiplied by 3. 54 × 3 = 162.", es: "Cada número se multiplica por 3. 54 × 3 = 162." } },
  { q: { en: "A triangle has angles of 50° and 60°. What is the third angle in degrees?", es: "Un triángulo tiene ángulos de 50° y 60°. ¿Cuánto mide el tercero, en grados?" }, answer: 70, explain: { en: "Angles add to 180°. 180 − 50 − 60 = 70.", es: "Los ángulos suman 180°. 180 − 50 − 60 = 70." } },
  { q: { en: "What is −3 + 8 × 2?", es: "¿Cuánto es −3 + 8 × 2?" }, answer: 13, explain: { en: "8 × 2 = 16, then −3 + 16 = 13.", es: "8 × 2 = 16, luego −3 + 16 = 13." } },
  { q: { en: "What is a 10% tip on a $45 meal, in dollars?", es: "¿Cuánto es una propina del 10% en una comida de $45, en dólares?" }, answer: 4.5, explain: { en: "Move the decimal one place: $4.50.", es: "Mueve el punto decimal un lugar: $4.50." } },
  { q: { en: "You flip a coin twice. What is the chance of two heads, as a percent?", es: "Lanzas una moneda dos veces. ¿Cuál es la probabilidad de dos caras, en porcentaje?" }, answer: 25, explain: { en: "½ × ½ = ¼ = 25%.", es: "½ × ½ = ¼ = 25%." } },
  { q: { en: "x + y = 10 and x − y = 4. What is x?", es: "x + y = 10 y x − y = 4. ¿Cuánto vale x?" }, answer: 7, explain: { en: "Add the equations: 2x = 14, so x = 7.", es: "Suma las ecuaciones: 2x = 14, así que x = 7." } },
  { q: { en: "A right triangle has legs 6 and 8. How long is the hypotenuse?", es: "Un triángulo rectángulo tiene catetos de 6 y 8. ¿Cuánto mide la hipotenusa?" }, answer: 10, explain: { en: "6² + 8² = 36 + 64 = 100, and √100 = 10.", es: "6² + 8² = 36 + 64 = 100, y √100 = 10." } },
  { q: { en: "What is ¾ of 120?", es: "¿Cuánto es ¾ de 120?" }, answer: 90, explain: { en: "120 ÷ 4 = 30, and 30 × 3 = 90.", es: "120 ÷ 4 = 30, y 30 × 3 = 90." } },
  { q: { en: "Write 0.35 as a percent (just the number).", es: "Escribe 0.35 como porcentaje (solo el número)." }, answer: 35, explain: { en: "Multiply by 100: 35%.", es: "Multiplica por 100: 35%." } },
  { q: { en: "What is the volume of a cube with side length 4?", es: "¿Cuál es el volumen de un cubo con lado 4?" }, answer: 64, explain: { en: "4 × 4 × 4 = 64.", es: "4 × 4 × 4 = 64." } },
  { q: { en: "What is the median of 3, 9, 4, 7, 5?", es: "¿Cuál es la mediana de 3, 9, 4, 7, 5?" }, answer: 5, explain: { en: "In order: 3, 4, 5, 7, 9. The middle is 5.", es: "En orden: 3, 4, 5, 7, 9. El de en medio es 5." } },
  { q: { en: "Solve for x: 4x − 9 = 3x + 2", es: "Resuelve x: 4x − 9 = 3x + 2" }, answer: 11, explain: { en: "Subtract 3x: x − 9 = 2, so x = 11.", es: "Resta 3x: x − 9 = 2, así que x = 11." } },
  { q: { en: "How many minutes are in 3.5 hours?", es: "¿Cuántos minutos hay en 3.5 horas?" }, answer: 210, explain: { en: "3.5 × 60 = 210.", es: "3.5 × 60 = 210." } },
];

export interface VocabWord {
  word: string;
  es: string;
  def: Localized;
  example: string;
}

export const VOCAB: VocabWord[] = [
  { word: "resilient", es: "resiliente", def: { en: "able to recover quickly from hard times", es: "capaz de recuperarse rápido de momentos difíciles" }, example: "After losing the first game, the resilient team won the tournament." },
  { word: "meticulous", es: "meticuloso", def: { en: "very careful about small details", es: "muy cuidadoso con los pequeños detalles" }, example: "She was meticulous when checking her lab measurements." },
  { word: "advocate", es: "defensor / abogar", def: { en: "a person who speaks up for a cause; or to publicly support something", es: "una persona que habla a favor de una causa; o apoyar algo públicamente" }, example: "He became an advocate for more bike lanes in town." },
  { word: "ambiguous", es: "ambiguo", def: { en: "having more than one possible meaning; unclear", es: "que puede tener más de un significado; poco claro" }, example: "The question was ambiguous, so many students answered it differently." },
  { word: "concise", es: "conciso", def: { en: "saying a lot in few words", es: "que dice mucho con pocas palabras" }, example: "Keep your scholarship answer concise: 150 words or less." },
  { word: "diligent", es: "diligente", def: { en: "hardworking and careful", es: "trabajador y cuidadoso" }, example: "Diligent practice every day improved his chess rating." },
  { word: "empathy", es: "empatía", def: { en: "understanding and sharing someone else's feelings", es: "entender y compartir los sentimientos de otra persona" }, example: "Good nurses show empathy for their patients." },
  { word: "feasible", es: "factible", def: { en: "possible to do", es: "posible de hacer" }, example: "Is it feasible to finish the project by Friday?" },
  { word: "inevitable", es: "inevitable", def: { en: "certain to happen; can't be avoided", es: "que seguro va a pasar; no se puede evitar" }, example: "Mistakes are inevitable when you learn something new." },
  { word: "mitigate", es: "mitigar", def: { en: "to make something less bad or less serious", es: "hacer que algo sea menos malo o grave" }, example: "Trees help mitigate the summer heat in the city." },
  { word: "novel", es: "novedoso", def: { en: "new and original (as an adjective)", es: "nuevo y original (como adjetivo)" }, example: "Their app used a novel way to find study partners." },
  { word: "pragmatic", es: "pragmático", def: { en: "practical; focused on what really works", es: "práctico; enfocado en lo que de verdad funciona" }, example: "A pragmatic plan fits the hours you actually have." },
  { word: "scrutinize", es: "examinar a fondo", def: { en: "to examine very carefully", es: "examinar con mucho cuidado" }, example: "Scrutinize any job offer that asks for money upfront." },
  { word: "substantial", es: "considerable", def: { en: "large in amount or importance", es: "grande en cantidad o importancia" }, example: "The scholarship covered a substantial part of tuition." },
  { word: "tenacious", es: "tenaz", def: { en: "not giving up easily", es: "que no se rinde fácilmente" }, example: "The tenacious debater kept improving her arguments." },
  { word: "verify", es: "verificar", def: { en: "to check that something is true", es: "comprobar que algo es verdad" }, example: "Always verify the deadline on the official website." },
  { word: "versatile", es: "versátil", def: { en: "able to do many different things well", es: "capaz de hacer bien muchas cosas distintas" }, example: "A versatile player can switch positions during the game." },
  { word: "articulate", es: "elocuente / expresar", def: { en: "able to express ideas clearly; or to say something clearly", es: "capaz de expresar ideas con claridad; o decir algo claramente" }, example: "Practice helps you articulate your goals in an interview." },
  { word: "collaborate", es: "colaborar", def: { en: "to work together with others", es: "trabajar junto con otros" }, example: "Our robotics team collaborates with a team from another school." },
  { word: "deduce", es: "deducir", def: { en: "to figure out from clues or evidence", es: "descubrir algo a partir de pistas o evidencia" }, example: "From the footprints, she deduced the dog went outside." },
  { word: "elaborate", es: "detallado / ampliar", def: { en: "detailed; or to add more details", es: "detallado; o agregar más detalles" }, example: "Can you elaborate on your volunteer experience?" },
  { word: "hypothesis", es: "hipótesis", def: { en: "an idea you test with an experiment", es: "una idea que pruebas con un experimento" }, example: "Our hypothesis was that plants grow faster with music." },
  { word: "infer", es: "inferir", def: { en: "to reach a conclusion from what you read or see", es: "llegar a una conclusión por lo que lees o ves" }, example: "We can infer the character is nervous from her shaking hands." },
  { word: "integrity", es: "integridad", def: { en: "being honest and doing the right thing", es: "ser honesto y hacer lo correcto" }, example: "Integrity means doing your own work, even when no one checks." },
  { word: "perspective", es: "perspectiva", def: { en: "a point of view", es: "un punto de vista" }, example: "Reading stories from other countries gives you a new perspective." },
  { word: "persevere", es: "perseverar", def: { en: "to keep trying even when it's hard", es: "seguir intentando aunque sea difícil" }, example: "She persevered through three drafts of her essay." },
  { word: "prioritize", es: "priorizar", def: { en: "to decide what is most important and do it first", es: "decidir qué es más importante y hacerlo primero" }, example: "Prioritize assignments that are due soonest." },
  { word: "relevant", es: "relevante", def: { en: "closely connected to the topic", es: "muy relacionado con el tema" }, example: "Only include relevant experience on your resume." },
  { word: "sustainable", es: "sostenible", def: { en: "able to continue over time without running out", es: "que puede continuar con el tiempo sin agotarse" }, example: "A sustainable study schedule leaves time for sleep." },
  { word: "unprecedented", es: "sin precedentes", def: { en: "never done or seen before", es: "que nunca se había hecho o visto antes" }, example: "The flood caused unprecedented damage in the town." },
];

export const DEBATE_PROMPTS: Localized[] = [
  { en: "Schools should switch to a four-day week.", es: "Las escuelas deberían cambiar a una semana de cuatro días." },
  { en: "Students should be allowed to use phones in class.", es: "Se debería permitir a los estudiantes usar el celular en clase." },
  { en: "Homework should be optional.", es: "La tarea debería ser opcional." },
  { en: "Every high school student should learn to code.", es: "Todos los estudiantes de prepa deberían aprender a programar." },
  { en: "The voting age should be lowered to 16.", es: "La edad para votar debería bajar a 16 años." },
  { en: "School should start later in the morning.", es: "La escuela debería empezar más tarde en la mañana." },
  { en: "Video games should be considered a sport.", es: "Los videojuegos deberían considerarse un deporte." },
  { en: "Community service should be required to graduate.", es: "El servicio comunitario debería ser obligatorio para graduarse." },
  { en: "School uniforms do more good than harm.", es: "Los uniformes escolares hacen más bien que mal." },
  { en: "Cities should make public buses free.", es: "Las ciudades deberían hacer gratis los autobuses públicos." },
  { en: "Students should learn personal finance before graduating.", es: "Los estudiantes deberían aprender finanzas personales antes de graduarse." },
  { en: "Social media does more harm than good for teens.", es: "Las redes sociales hacen más daño que bien a los adolescentes." },
  { en: "Every student should learn a second language.", es: "Todos los estudiantes deberían aprender un segundo idioma." },
  { en: "Zoos should exist.", es: "Los zoológicos deberían existir." },
  { en: "Schools should replace some textbooks with laptops.", es: "Las escuelas deberían cambiar algunos libros por laptops." },
  { en: "College should be free at public universities.", es: "La universidad pública debería ser gratis." },
  { en: "AI tools should be allowed for homework.", es: "Se deberían permitir herramientas de IA para hacer la tarea." },
  { en: "Students should grade their teachers.", es: "Los estudiantes deberían calificar a sus maestros." },
  { en: "Plastic bags should be banned in stores.", es: "Se deberían prohibir las bolsas de plástico en las tiendas." },
  { en: "Athletes should be required to keep a B average.", es: "Los atletas deberían tener que mantener un promedio de B." },
  { en: "Schools should teach cooking.", es: "Las escuelas deberían enseñar a cocinar." },
  { en: "Space exploration is worth the cost.", es: "La exploración espacial vale lo que cuesta." },
  { en: "Year-round school is better than a long summer break.", es: "La escuela todo el año es mejor que unas vacaciones largas." },
  { en: "Every town should have a youth council.", es: "Cada ciudad debería tener un consejo juvenil." },
  { en: "Remote learning should be an option for all students.", es: "Las clases en línea deberían ser una opción para todos." },
  { en: "Fast food restaurants should post calorie warnings.", es: "Los restaurantes de comida rápida deberían mostrar advertencias de calorías." },
  { en: "Students should be paid for good grades.", es: "Se debería pagar a los estudiantes por buenas calificaciones." },
  { en: "Art and music are as important as math and science.", es: "El arte y la música son tan importantes como las matemáticas y las ciencias." },
  { en: "The minimum age for a driver's license should be 18.", es: "La edad mínima para la licencia de manejo debería ser 18." },
  { en: "Schools should have later deadlines instead of late penalties.", es: "Las escuelas deberían dar más tiempo en vez de quitar puntos por entregar tarde." },
];
