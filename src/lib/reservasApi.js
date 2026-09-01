// Client for the live reservations backend. See API.md for the full contract
// — the reservation endpoints (disponibilidad, crear, cancelar) are public,
// no auth required.
const BASE_URL = "https://backend-reservas-ochre.vercel.app";

export class ReservaError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ReservaError";
    this.status = status;
  }
}

async function parseErrorMessage(response) {
  try {
    const body = await response.json();
    if (Array.isArray(body.message)) return body.message.join(" ");
    if (body.message) return body.message;
  } catch {
    // No JSON body to read — fall through to the generic message.
  }
  return `HTTP ${response.status}`;
}

export async function fetchDisponibilidad(negocioId, profesionalId, fechaISO, servicioId) {
  const url = `${BASE_URL}/negocios/${negocioId}/profesionales/${profesionalId}/disponibilidad?fecha=${fechaISO}&servicioId=${servicioId}`;
  const res = await fetch(url);
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}

export async function crearReservaServicio({
  negocioId,
  profesionalId,
  servicioId,
  inicio,
  clienteNombre,
  clienteEmail,
  clienteTelefono,
}) {
  const res = await fetch(`${BASE_URL}/reservas-servicios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      negocioId,
      profesionalId,
      servicioId,
      inicio,
      clienteNombre,
      clienteEmail,
      clienteTelefono,
    }),
  });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}
