// Ready-made packing lists (Phase 5.3), in English and Spanish.
import type { Localized } from "@/i18n/config";

export const PACKING_TEMPLATES: { id: string; emoji: string; items: Localized[] }[] = [
  {
    id: "sports", emoji: "⚽",
    items: [
      { en: "Uniform and extra socks", es: "Uniforme y calcetines extra" }, { en: "Shoes / cleats", es: "Tenis / tacos" }, { en: "Water bottle (filled)", es: "Botella de agua (llena)" },
      { en: "Healthy snacks", es: "Botanas saludables" }, { en: "Sunscreen and hat", es: "Bloqueador y gorra" }, { en: "Towel", es: "Toalla" }, { en: "Phone charger", es: "Cargador del teléfono" },
      { en: "Medical forms / ID", es: "Formularios médicos / identificación" }, { en: "Money for food", es: "Dinero para comida" },
    ],
  },
  {
    id: "academic", emoji: "🏆",
    items: [
      { en: "Pencils, pens and erasers", es: "Lápices, plumas y borradores" }, { en: "Approved calculator + extra batteries", es: "Calculadora permitida + pilas extra" }, { en: "Registration confirmation", es: "Confirmación de inscripción" },
      { en: "Notes for a last review", es: "Apuntes para un último repaso" }, { en: "Water and snacks", es: "Agua y botanas" }, { en: "Watch (no smartwatch)", es: "Reloj (no inteligente)" }, { en: "Light jacket (rooms get cold)", es: "Chamarra ligera (los salones son fríos)" },
    ],
  },
  {
    id: "camp", emoji: "🏕️",
    items: [
      { en: "Clothes for each day + 1 extra", es: "Ropa para cada día + 1 extra" }, { en: "Pajamas", es: "Pijama" }, { en: "Toothbrush and toiletries", es: "Cepillo de dientes y artículos de baño" }, { en: "Towel", es: "Toalla" },
      { en: "Sleeping bag or sheets + pillow", es: "Bolsa de dormir o sábanas + almohada" }, { en: "Medicines (labeled)", es: "Medicinas (con nombre)" }, { en: "Bug spray and sunscreen", es: "Repelente y bloqueador" },
      { en: "Flashlight", es: "Linterna" }, { en: "Reusable water bottle", es: "Botella de agua reusable" }, { en: "Signed forms", es: "Formularios firmados" },
    ],
  },
  {
    id: "trip", emoji: "🎓",
    items: [
      { en: "School ID", es: "Credencial escolar" }, { en: "Questions to ask (written down)", es: "Preguntas para hacer (por escrito)" }, { en: "Comfortable walking shoes", es: "Zapatos cómodos para caminar" },
      { en: "Phone + charger", es: "Teléfono + cargador" }, { en: "Notebook and pen", es: "Libreta y pluma" }, { en: "Water and snacks", es: "Agua y botanas" }, { en: "A parent's phone number", es: "El teléfono de tu mamá o papá" },
    ],
  },
  {
    id: "interview", emoji: "💼",
    items: [
      { en: "Clean, neat outfit", es: "Ropa limpia y ordenada" }, { en: "2 printed copies of your resume", es: "2 copias impresas de tu currículum" }, { en: "List of references", es: "Lista de referencias" },
      { en: "Pen and small notebook", es: "Pluma y libreta pequeña" }, { en: "Directions + leave 15 minutes early", es: "Cómo llegar + salir 15 minutos antes" }, { en: "2 questions to ask them", es: "2 preguntas para hacerles" },
    ],
  },
  {
    id: "volunteer", emoji: "🤝",
    items: [
      { en: "Closed-toe shoes", es: "Zapatos cerrados" }, { en: "Clothes that can get dirty", es: "Ropa que se pueda ensuciar" }, { en: "Water bottle", es: "Botella de agua" },
      { en: "Signed permission form (if under 18)", es: "Permiso firmado (si eres menor de 18)" }, { en: "Hours log to get signed", es: "Registro de horas para que lo firmen" }, { en: "Sunscreen and hat", es: "Bloqueador y gorra" },
    ],
  },
];
