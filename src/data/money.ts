// Phase 8: Money and access. Real, long-running national programs, plus where to ask locally.
import type { Localized } from "@/i18n/config";

export interface Resource {
  name: string | Localized;
  what: Localized;
  url?: string;
}

export const FEE_WAIVERS: Resource[] = [
  { name: "SAT fee waivers (College Board)", what: { en: "Eligible low-income students take the SAT for free, and can get college application fee waivers too. Ask your counselor.", es: "Estudiantes de bajos ingresos que califican toman el SAT gratis y también pueden recibir exención de cuotas de solicitud a universidades. Pregunta a tu consejero." }, url: "https://satsuite.collegeboard.org/sat/registration/fee-waivers" },
  { name: "ACT fee waivers", what: { en: "Eligible students can take the ACT for free (counselors give out waivers).", es: "Estudiantes que califican pueden tomar el ACT gratis (los consejeros dan las exenciones)." }, url: "https://www.act.org/" },
  { name: "AP exam fee reductions", what: { en: "Students with financial need pay less for AP exams. Ask your AP coordinator.", es: "Estudiantes con necesidad económica pagan menos por los exámenes AP. Pregunta a tu coordinador de AP." }, url: "https://apstudents.collegeboard.org/" },
  { name: "Common App fee waiver", what: { en: "Check the fee waiver box in the Common App if you qualify — no extra paperwork for many students.", es: "Marca la opción de exención en la Common App si calificas — muchos estudiantes no necesitan más papeles." }, url: "https://www.commonapp.org/" },
  { name: "ApplyTexas", what: { en: "Many Texas colleges waive application fees for students with need. Ask the college's admissions office.", es: "Muchas universidades de Texas no cobran la solicitud a estudiantes con necesidad. Pregunta en la oficina de admisiones." }, url: "https://www.applytexas.org/" },
  { name: "NACAC fee waiver", what: { en: "Lets eligible seniors apply to many colleges for free. Your counselor can help.", es: "Permite a estudiantes de último año que califican aplicar gratis a muchas universidades. Tu consejero te ayuda." }, url: "https://www.nacacnet.org/" },
  { name: "Competitions & programs", what: { en: "Many competitions (like the Scholastic Art & Writing Awards) and camps have fee waivers or scholarships — always ask, even if you don't see one listed.", es: "Muchas competencias (como los premios Scholastic) y campamentos tienen exención de pago o becas — siempre pregunta, aunque no lo veas anunciado." } },
];

export const FREE_GEAR: Resource[] = [
  { name: { en: "Your school", es: "Tu escuela" }, what: { en: "Ask about loaner laptops, calculators, band instruments, sports equipment, uniforms and school supply closets. Counselors often know about donations.", es: "Pregunta por laptops prestadas, calculadoras, instrumentos, equipo deportivo, uniformes y útiles donados. Los consejeros conocen las donaciones." } },
  { name: "PCs for People", what: { en: "Low-cost refurbished computers and internet for eligible low-income families.", es: "Computadoras reacondicionadas e internet a bajo costo para familias de bajos ingresos que califican." }, url: "https://www.pcsforpeople.org/" },
  { name: "EveryoneOn", what: { en: "Search by ZIP code for low-cost internet plans, devices and digital skills classes.", es: "Busca por código postal planes de internet económicos, aparatos y clases de habilidades digitales." }, url: "https://www.everyoneon.org/" },
  { name: "Good Sports", what: { en: "Donates sports equipment and apparel to youth programs — ask your coach or league to apply.", es: "Dona equipo y ropa deportiva a programas juveniles — pide a tu entrenador o liga que aplique." }, url: "https://www.goodsports.org/" },
  { name: "2-1-1 Texas", what: { en: "Dial 211 to find back-to-school supply drives, free meals, clothing and more near you.", es: "Marca 211 para encontrar colectas de útiles, comida gratis, ropa y más cerca de ti." }, url: "https://www.211texas.org/" },
];

export const FREE_INTERNET: Resource[] = [
  { name: { en: "Public libraries", es: "Bibliotecas públicas" }, what: { en: "Free Wi-Fi and computers. Many libraries also lend Wi-Fi hotspots you can take home — ask at the desk.", es: "Wi-Fi y computadoras gratis. Muchas bibliotecas también prestan hotspots de Wi-Fi para llevar a casa — pregunta en el mostrador." } },
  { name: "Lifeline (FCC program)", what: { en: "Monthly discount on phone or internet service for eligible low-income households.", es: "Descuento mensual en teléfono o internet para hogares de bajos ingresos que califican." }, url: "https://www.lifelinesupport.org/" },
  { name: "AT&T Access", what: { en: "Low-cost home internet for households in programs like SNAP, where AT&T offers service.", es: "Internet en casa a bajo costo para hogares en programas como SNAP, donde AT&T da servicio." }, url: "https://www.att.com/internet/access/" },
  { name: "EveryoneOn", what: { en: "Finds every low-cost internet offer available at your ZIP code.", es: "Encuentra todas las ofertas de internet económico en tu código postal." }, url: "https://www.everyoneon.org/" },
  { name: { en: "Rumbo offline", es: "Rumbo sin internet" }, what: { en: "Install Rumbo and your saved opportunities, plans, flashcards and schedule work with no internet. Turn on Low data mode on slow connections.", es: "Instala Rumbo y tus guardados, planes, tarjetas y horario funcionan sin internet. Activa el modo de pocos datos con internet lento." } },
];

export const WIFI_SAFETY: Localized = {
  en: "On public Wi-Fi, don't log into bank accounts, and only type passwords on sites that start with https.",
  es: "En Wi-Fi público, no entres a cuentas de banco y escribe contraseñas solo en sitios que empiecen con https.",
};
