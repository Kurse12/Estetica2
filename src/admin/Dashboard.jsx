import { useCallback, useEffect, useState } from "react";
import { locations, professionals, serviceByApiId } from "../data";
import { getValidAccessToken } from "../lib/adminAuth";
import { fetchReservasServicios, cancelarReservaServicio } from "../lib/adminApi";
import { ReservaError } from "../lib/reservasApi";
import { startOfDay } from "../lib/availability";
import Icon from "../components/Icon";

const dateTimeFmt = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Dashboard({ session, onLogout }) {
  const [branchId, setBranchId] = useState(locations[0].id);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const branch = locations.find((l) => l.id === branchId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = await getValidAccessToken();
    if (!token) {
      onLogout();
      return;
    }
    try {
      const desde = startOfDay(new Date()).toISOString();
      const data = await fetchReservasServicios(branch.negocioId, token, { desde });
      setReservas(data);
    } catch (err) {
      if (err instanceof ReservaError && err.status === 401) {
        onLogout();
        return;
      }
      if (err instanceof ReservaError && err.status === 403) {
        setError("Tu cuenta no tiene acceso a esta sucursal.");
      } else {
        setError("No se pudieron cargar las reservas.");
      }
      setReservas([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch.negocioId, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id) {
    if (cancellingId) return;
    setCancellingId(id);
    try {
      await cancelarReservaServicio(id);
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado: "cancelada" } : r))
      );
    } catch {
      setError("No se pudo cancelar la reserva. Probá de nuevo.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <h1>Reservas — Sakura Bloom</h1>
        <div className="admin-dashboard__session">
          <span>{session.email}</span>
          <button type="button" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>

      <div className="admin-branch-tabs">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            className={branchId === loc.id ? "is-active" : ""}
            onClick={() => setBranchId(loc.id)}
          >
            {loc.es.area}
          </button>
        ))}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          <Icon name="alert" size={15} />
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-empty">Cargando reservas…</p>
      ) : reservas.length === 0 ? (
        <p className="admin-empty">No hay reservas próximas en {branch.es.area}.</p>
      ) : (
        <ul className="admin-reserva-list">
          {reservas.map((r) => {
            const profesional = professionals.find((p) => p.profesionalId === r.profesionalId);
            const servicio = serviceByApiId(branchId, r.servicioId);
            const cancelada = r.estado === "cancelada";
            return (
              <li key={r.id} className={`admin-reserva ${cancelada ? "is-cancelled" : ""}`}>
                <div className="admin-reserva__when">
                  <Icon name="calendar" size={16} />
                  {dateTimeFmt.format(new Date(r.inicio))}
                </div>
                <div className="admin-reserva__what">
                  <strong>{servicio?.es.name ?? "Servicio"}</strong>
                  <span> con {profesional?.name ?? "—"}</span>
                </div>
                <div className="admin-reserva__who">
                  <span>{r.clienteNombre}</span>
                  <span>{r.clienteEmail}</span>
                  {r.clienteTelefono && (
                    <span>
                      <Icon name="phone" size={13} />
                      {r.clienteTelefono}
                    </span>
                  )}
                </div>
                <div className="admin-reserva__status">
                  {cancelada ? (
                    <span className="admin-badge admin-badge--cancelled">Cancelada</span>
                  ) : (
                    <button
                      type="button"
                      className="admin-reserva__cancel"
                      disabled={cancellingId === r.id}
                      onClick={() => handleCancel(r.id)}
                    >
                      {cancellingId === r.id ? "Cancelando…" : "Cancelar"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
