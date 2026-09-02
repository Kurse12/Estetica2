import { ReservaError } from "./reservasApi";

const BASE_URL = "https://backend-reservas-ochre.vercel.app";

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

export async function fetchReservasServicios(negocioId, accessToken, { desde } = {}) {
  const url = new URL(`${BASE_URL}/negocios/${negocioId}/reservas-servicios`);
  if (desde) url.searchParams.set("desde", desde);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}

export async function cancelarReservaServicio(id) {
  const res = await fetch(`${BASE_URL}/reservas-servicios/${id}/cancelar`, { method: "PATCH" });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}
