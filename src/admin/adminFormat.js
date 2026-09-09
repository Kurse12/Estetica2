// Small formatting helpers shared by the agenda list and the calendar view.
export const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const dayFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export const timeFmt = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

export const ESTADOS = ["pendiente", "confirmada", "realizada", "cancelada"];

export const ESTADO_LABELS = {
  pendiente: "Pendiente",
  confirmada: "Confirmado",
  realizada: "Realizado",
  cancelada: "Cancelado",
};

// wa.me needs digits only (no "+", spaces, or dashes) to link straight into a chat.
export function whatsappLink(reserva, servicioNombre) {
  if (!reserva.clienteTelefono) return null;
  const digits = reserva.clienteTelefono.replace(/\D/g, "");
  if (!digits) return null;

  const fecha = dateTimeFmt.format(new Date(reserva.inicio));
  const nombre = reserva.clienteNombre?.split(" ")[0] ?? "";
  const servicio = servicioNombre ?? "tu turno";

  let texto;
  if (reserva.estado === "pendiente") {
    texto = `Hola ${nombre}! Te escribimos de Sakura Bloom para confirmar tu turno de ${servicio} el ${fecha}. ¿Nos confirmás que podés venir?`;
  } else if (reserva.estado === "confirmada") {
    texto = `Hola ${nombre}! Te recordamos tu turno de ${servicio} en Sakura Bloom el ${fecha}.`;
  } else {
    texto = `Hola ${nombre}! Te escribimos de Sakura Bloom por tu turno de ${servicio} del ${fecha}.`;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`;
}
