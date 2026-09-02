// Real, verified Unsplash photography (sourced and checked to resolve).
// Professional bios and prices are realistic placeholders pending real
// content — see PRODUCT.md "Evidence on Hand". The brand name (Sakura Bloom)
// is settled and is not a placeholder.

const img = (id, w) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&fm=jpg&fit=crop&auto=format`;

export const services = [
  {
    id: "corte",
    icon: "scissors",
    es: { name: "Corte y styling", desc: "Corte a medida, lavado y peinado final." },
    en: { name: "Cut & styling", desc: "Tailored cut, wash, and finished style." },
    duration: 50,
    price: 28,
  },
  {
    id: "color",
    icon: "drop",
    es: { name: "Color y balayage", desc: "Color completo, mechas o balayage a mano alzada." },
    en: { name: "Color & balayage", desc: "Full color, highlights, or hand-painted balayage." },
    duration: 120,
    price: 85,
  },
  {
    id: "manicura",
    icon: "hand",
    es: { name: "Manicura semipermanente", desc: "Esmaltado de larga duración, cutículas incluidas." },
    en: { name: "Gel manicure", desc: "Long-wear polish, cuticle care included." },
    duration: 45,
    price: 22,
  },
  {
    id: "pedicura",
    icon: "foot",
    es: { name: "Pedicura spa", desc: "Exfoliación, masaje e hidratación completa." },
    en: { name: "Spa pedicure", desc: "Exfoliation, massage, and full hydration." },
    duration: 55,
    price: 30,
  },
  {
    id: "facial",
    icon: "face",
    es: { name: "Facial hidratante", desc: "Limpieza profunda y mascarilla según tu piel." },
    en: { name: "Hydrating facial", desc: "Deep cleanse and mask matched to your skin." },
    duration: 60,
    price: 48,
  },
  {
    id: "maquillaje",
    icon: "brush",
    es: { name: "Maquillaje social", desc: "Look completo para eventos, fotos o salidas." },
    en: { name: "Event makeup", desc: "Full look for events, photos, or a night out." },
    duration: 45,
    price: 40,
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
    photo: img("photo-1494790108377-be9c29b29330", 700),
    photoSmall: img("photo-1494790108377-be9c29b29330", 112),
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
    photo: img("photo-1580489944761-15a19d654956", 700),
    photoSmall: img("photo-1580489944761-15a19d654956", 112),
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
    photo: img("photo-1627161683077-e34782c24d81", 700),
    photoSmall: img("photo-1627161683077-e34782c24d81", 112),
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
    photo: img("photo-1573497019940-1c28c88b4f3e", 700),
    photoSmall: img("photo-1573497019940-1c28c88b4f3e", 112),
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
    photo: img("photo-1634449571010-02389ed0f9b0", 900),
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p2",
    es: { caption: "Peinado con bucles" },
    en: { caption: "Curled styling" },
    photo: img("photo-1560869713-7d0a29430803", 900),
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p3",
    es: { caption: "Balayage" },
    en: { caption: "Balayage" },
    photo: img("photo-1554519934-e32b1629d9ee", 900),
    serviceId: "color",
    professionalId: "camila",
  },
  {
    id: "p4",
    es: { caption: "Brushing profesional" },
    en: { caption: "Professional blow-dry" },
    photo: img("photo-1580618672591-eb180b1a973f", 900),
    serviceId: "corte",
    professionalId: "camila",
  },
  {
    id: "p5",
    es: { caption: "Manicura de precisión" },
    en: { caption: "Precision manicure" },
    photo: img("photo-1632345031435-8727f6897d53", 900),
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p6",
    es: { caption: "Esmaltado de temporada" },
    en: { caption: "Seasonal polish" },
    photo: img("photo-1607779097040-26e80aa78e66", 900),
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p7",
    es: { caption: "Manicura natural" },
    en: { caption: "Natural manicure" },
    photo: img("photo-1610992015762-45dca7fa3a85", 900),
    serviceId: "manicura",
    professionalId: "valentina",
  },
  {
    id: "p8",
    es: { caption: "Facial hidratante" },
    en: { caption: "Hydrating facial" },
    photo: img("photo-1616394584738-fc6e612e71b9", 900),
    serviceId: "facial",
    professionalId: "sofia",
  },
  {
    id: "p9",
    es: { caption: "Maquillaje social" },
    en: { caption: "Event makeup" },
    photo: img("photo-1630084775816-7abb7383ded5", 900),
    serviceId: "maquillaje",
    professionalId: "marcela",
  },
  {
    id: "p10",
    es: { caption: "Maquillaje editorial" },
    en: { caption: "Editorial makeup" },
    photo: img("photo-1636023730877-233b9237d4ec", 900),
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
