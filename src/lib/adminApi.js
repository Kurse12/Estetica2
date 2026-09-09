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

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function request(path, { method = "GET", accessToken, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? authHeaders(accessToken) : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}

export async function fetchReservasServicios(negocioId, accessToken, { desde, hasta, profesionalId } = {}) {
  const url = new URL(`${BASE_URL}/negocios/${negocioId}/reservas-servicios`);
  if (desde) url.searchParams.set("desde", desde);
  if (hasta) url.searchParams.set("hasta", hasta);
  if (profesionalId) url.searchParams.set("profesionalId", profesionalId);
  const res = await fetch(url, { headers: authHeaders(accessToken) });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}

// Publica (capability token = el id de la reserva), no requiere accessToken.
export async function cancelarReservaServicio(id) {
  const res = await fetch(`${BASE_URL}/reservas-servicios/${id}/cancelar`, { method: "PATCH" });
  if (!res.ok) throw new ReservaError(await parseErrorMessage(res), res.status);
  return res.json();
}

export function confirmarReservaServicio(id, accessToken) {
  return request(`/reservas-servicios/${id}/confirmar`, { method: "PATCH", accessToken });
}

export function completarReservaServicio(id, accessToken) {
  return request(`/reservas-servicios/${id}/completar`, { method: "PATCH", accessToken });
}

export function fetchServicios(negocioId) {
  return request(`/negocios/${negocioId}/servicios`);
}

export function createServicio(negocioId, accessToken, dto) {
  return request(`/negocios/${negocioId}/servicios`, { method: "POST", accessToken, body: dto });
}

export function updateServicio(negocioId, id, accessToken, dto) {
  return request(`/negocios/${negocioId}/servicios/${id}`, { method: "PATCH", accessToken, body: dto });
}

export function removeServicio(negocioId, id, accessToken) {
  return request(`/negocios/${negocioId}/servicios/${id}`, { method: "DELETE", accessToken });
}

export function fetchProfesionales(negocioId) {
  return request(`/negocios/${negocioId}/profesionales`);
}

export function createProfesional(negocioId, accessToken, dto) {
  return request(`/negocios/${negocioId}/profesionales`, { method: "POST", accessToken, body: dto });
}

export function updateProfesional(negocioId, id, accessToken, dto) {
  return request(`/negocios/${negocioId}/profesionales/${id}`, { method: "PATCH", accessToken, body: dto });
}

export function removeProfesional(negocioId, id, accessToken) {
  return request(`/negocios/${negocioId}/profesionales/${id}`, { method: "DELETE", accessToken });
}
