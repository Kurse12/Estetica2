// Professional bios are realistic placeholders pending real content — see
// PRODUCT.md "Evidence on Hand". The brand name (Sakura Bloom) is settled and
// is not a placeholder. Service prices are real, provided by the owner
// (2026-09-03), in Argentine pesos.

export const priceFmt = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

import camilaReyes from "./assets/camila-reyes.jpg";
import valentinaOrtiz from "./assets/valentina-ortiz.jpg";
import sofiaAguirre from "./assets/sofia-aguirre.jpg";
import marcelaDuarte from "./assets/marcela-duarte.jpg";
import ritualDeLavado from "./assets/ritual-de-lavado.jpg";
import peinadoConBucles from "./assets/peinado-con-bucles.jpg";
import balayage from "./assets/balayage.jpg";
import brushingProfesional from "./assets/brushing-profesional.jpg";
import manicuraDePrecision from "./assets/manicura-de-precision.jpg";
import esmaltadoTemporada from "./assets/esmaltado-de-temporada.jpg";
import esmaltadoNatural from "./assets/esmaltado-natural.jpg";
import facialHidratante from "./assets/facial-hidratante.jpg";
import maquillajeEditorial from "./assets/maquillaje-editorial.jpg";
import maquillajeSocial from "./assets/maquillaje-social.jpg";

export const services = [
  {
    id: "corte",
    icon: "scissors",
    es: { name: "Corte y styling", desc: "Corte a medida, lavado y peinado final." },
    en: { name: "Cut & styling", desc: "Tailored cut, wash, and finished style." },
    duration: 50,
    price: 40000,
  },
  {
    id: "color",
    icon: "drop",
    es: { name: "Color y balayage", desc: "Color completo, mechas o balayage a mano alzada." },
    en: { name: "Color & balayage", desc: "Full color, highlights, or hand-painted balayage." },
    duration: 120,
    price: 120000,
  },
  {
    id: "manicura",
    icon: "hand",
    es: { name: "Manicura semipermanente", desc: "Esmaltado de larga duración, cutículas incluidas." },
    en: { name: "Gel manicure", desc: "Long-wear polish, cuticle care included." },
    duration: 45,
    price: 25000,
  },
  {
    id: "pedicura",
    icon: "foot",
    es: { name: "Pedicura spa", desc: "Exfoliación, masaje e hidratación completa." },
    en: { name: "Spa pedicure", desc: "Exfoliation, massage, and full hydration." },
    duration: 55,
    price: 35000,
  },
  {
    id: "facial",
    icon: "face",
    es: { name: "Facial hidratante", desc: "Limpieza profunda y mascarilla según tu piel." },
    en: { name: "Hydrating facial", desc: "Deep cleanse and mask matched to your skin." },
    duration: 60,
    price: 45000,
  },
  {
    id: "maquillaje",
    icon: "brush",
    es: { name: "Maquillaje social", desc: "Look completo para eventos, fotos o salidas." },
    en: { name: "Event makeup", desc: "Full look for events, photos, or a night out." },
    duration: 45,
    price: 45000,
  },
];

// UUIDs of the matching resources on the live reservations backend
// (see API.md). Seeded once via a one-off admin script — negocioId lives on
// each location below, profesionalId on each professional, and servicioId
// here since the same local service id maps to a different UUID per branch.
const SERVICE_API_IDS = {
  palermo: {
    corte: "75ef7965-ddba-4352-83cf-21053dba62a4",
    color: "fe63f958-65f4-41cd-a7b4-55c0d34dbebb",
    maquillaje: "5d2122d9-b6e9-4d6a-aae1-9781d5a69942",
  },
  belgrano: {
    manicura: "4fe06756-9fae-452f-9200-3f3b44b916a7",
    pedicura: "d79b13de-6f99-46a7-a552-0f35e0a565e4",
  },
  recoleta: {
    facial: "15ffda45-b706-4766-b552-b13f853f0b11",
  },
};

export function serviceApiId(branchId, serviceId) {
  return SERVICE_API_IDS[branchId]?.[serviceId] ?? null;
}

// Reverse of serviceApiId: the admin dashboard gets a service UUID back from
// the backend and needs the local service (for its name) to display it.
export function serviceByApiId(branchId, apiId) {
  const localId = Object.entries(SERVICE_API_IDS[branchId] ?? {}).find(
    ([, id]) => id === apiId
  )?.[0];
  return services.find((s) => s.id === localId) ?? null;
}

export const professionals = [
  {
    id: "camila",
    profesionalId: "162f5b1d-3bc3-4233-be36-38f55a7f54fe",
    name: "Camila Reyes",
    es: { role: "Estilista senior", specialty: "Cortes y color", bio: "12 años dando forma a cabello de todo tipo, sin dos cortes iguales." },
    en: { role: "Senior stylist", specialty: "Cuts & color", bio: "12 years shaping every kind of hair — no two cuts alike." },
    years: 12,
    photo: camilaReyes,
    photoSmall: camilaReyes,
    services: ["corte", "color"],
    branch: "palermo",
  },
  {
    id: "valentina",
    profesionalId: "21d2ddf1-e10e-45e8-894a-386b2f13d645",
    name: "Valentina Ortiz",
    es: { role: "Técnica en uñas", specialty: "Manicura y pedicura", bio: "Precisión milimétrica y una vitrina de esmaltes que no para de crecer." },
    en: { role: "Nail technician", specialty: "Manicure & pedicure", bio: "Millimeter precision and a polish shelf that never stops growing." },
    years: 7,
    photo: valentinaOrtiz,
    photoSmall: valentinaOrtiz,
    services: ["manicura", "pedicura"],
    branch: "belgrano",
  },
  {
    id: "sofia",
    profesionalId: "f6f164ce-f8ca-4136-86e4-cdf3a5c933fb",
    name: "Sofía Aguirre",
    es: { role: "Esteticista", specialty: "Faciales", bio: "Diagnostica tu piel antes de tocarla, y elige el tratamiento en consecuencia." },
    en: { role: "Esthetician", specialty: "Facials", bio: "Reads your skin before touching it, and picks the treatment to match." },
    years: 9,
    photo: sofiaAguirre,
    photoSmall: sofiaAguirre,
    services: ["facial"],
    branch: "recoleta",
  },
  {
    id: "marcela",
    profesionalId: "bf64c019-6800-45c5-be7e-fdf1911756ae",
    name: "Marcela Duarte",
    es: { role: "Maquilladora", specialty: "Maquillaje social y editorial", bio: "Del backstage de moda al salón: cada rostro, un plan distinto." },
    en: { role: "Makeup artist", specialty: "Event & editorial makeup", bio: "From fashion backstage to the salon floor: every face gets its own plan." },
    years: 10,
    photo: marcelaDuarte,
    photoSmall: marcelaDuarte,
    services: ["maquillaje"],
    branch: "palermo",
  },
];

// Each frame names the service and the professional it came from, so the
// carousel can route a "book this" click straight into the wizard instead of
// only ever proposing the visitor start from zero.
export const portfolio = [
  {
    id: "p1",
    es: { caption: "Ritual de lavado" },
    en: { caption: "Wash ritual" },
    photo: ritualDeLavado,
    // Portrait source landing in the wide (landscape) tile — bias the cover
    // crop toward the top so the face and hands survive instead of a
    // center crop that would show only a strip of hair.
    photoPosition: "50% 22%",
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p2",
    es: { caption: "Peinado con bucles" },
    en: { caption: "Curled styling" },
    photo: peinadoConBucles,
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p3",
    es: { caption: "Balayage" },
    en: { caption: "Balayage" },
    photo: balayage,
    serviceId: "color",
    professionalId: "camila",
  },
  {
    id: "p4",
    es: { caption: "Brushing profesional" },
    en: { caption: "Professional blow-dry" },
    photo: brushingProfesional,
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p5",
    es: { caption: "Manicura de precisión" },
    en: { caption: "Precision manicure" },
    photo: manicuraDePrecision,
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p6",
    es: { caption: "Esmaltado de temporada" },
    en: { caption: "Seasonal polish" },
    photo: esmaltadoTemporada,
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p7",
    es: { caption: "Manicura natural" },
    en: { caption: "Natural manicure" },
    photo: esmaltadoNatural,
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p8",
    es: { caption: "Facial hidratante" },
    en: { caption: "Hydrating facial" },
    photo: facialHidratante,
    serviceId: "facial",
    professionalId: "sofia",
  },
  {
    id: "p9",
    es: { caption: "Maquillaje social" },
    en: { caption: "Event makeup" },
    photo: maquillajeSocial,
    serviceId: "maquillaje",
    professionalId: "marcela",
  },
  {
    id: "p10",
    es: { caption: "Maquillaje editorial" },
    en: { caption: "Editorial makeup" },
    photo: maquillajeEditorial,
    serviceId: "maquillaje",
    professionalId: "marcela",
  },
];

/* The three houses. Coordinates are the pin's own truth — the map reads them
   directly and the "how to get there" links hand the same pair to Google Maps,
   so a branch is moved by editing one line here and nothing else. */
export const locations = [
  {
    id: "palermo",
    negocioId: "0384f0d1-3866-445f-bbcb-2c02768eb6d4",
    coords: [-34.5885, -58.4278],
    phone: "+54 11 4832 7710",
    // Tue-Sat: closed Sunday AND Monday, 9:00-19:00.
    closedWeekdays: [0, 1],
    openHour: 9,
    closeHour: 19,
    es: {
      name: "Sakura Bloom Palermo",
      area: "Palermo Soho",
      address: "Gorriti 4890",
      hours: "Mar a sáb, 9:00 a 19:00",
    },
    en: {
      name: "Sakura Bloom Palermo",
      area: "Palermo Soho",
      address: "Gorriti 4890",
      hours: "Tue to Sat, 9am to 7pm",
    },
  },
  {
    id: "belgrano",
    negocioId: "78d17435-068b-4447-b496-f70f1c1ac406",
    coords: [-34.5622, -58.4562],
    phone: "+54 11 4783 2140",
    // Tue-Sat: closed Sunday AND Monday, 10:00-20:00.
    closedWeekdays: [0, 1],
    openHour: 10,
    closeHour: 20,
    es: {
      name: "Sakura Bloom Belgrano",
      area: "Belgrano R",
      address: "Av. Cabildo 2230",
      hours: "Mar a sáb, 10:00 a 20:00",
    },
    en: {
      name: "Sakura Bloom Belgrano",
      area: "Belgrano R",
      address: "Av. Cabildo 2230",
      hours: "Tue to Sat, 10am to 8pm",
    },
  },
  {
    id: "recoleta",
    negocioId: "32a7b8a0-088f-4922-b3c6-6a006439eced",
    coords: [-34.5952, -58.3925],
    phone: "+54 11 4815 6690",
    // Mon-Sat: closed Sunday only, 9:00-18:00.
    closedWeekdays: [0],
    openHour: 9,
    closeHour: 18,
    es: {
      name: "Sakura Bloom Recoleta",
      area: "Recoleta",
      address: "Av. Callao 1180",
      hours: "Lun a sáb, 9:00 a 18:00",
    },
    en: {
      name: "Sakura Bloom Recoleta",
      area: "Recoleta",
      address: "Av. Callao 1180",
      hours: "Mon to Sat, 9am to 6pm",
    },
  },
];
