import { useCallback, useEffect, useMemo, useState } from "react";
import { locations, professionalByApiId, serviceByApiId } from "../data";
import { getValidAccessToken } from "../lib/adminAuth";
import {
  fetchReservasServicios,
  cancelarReservaServicio,
  confirmarReservaServicio,
  completarReservaServicio,
  fetchServicios,
  createServicio,
  updateServicio,
  removeServicio,
  fetchProfesionales,
  createProfesional,
  updateProfesional,
  removeProfesional,
} from "../lib/adminApi";
import { ReservaError } from "../lib/reservasApi";
import Icon from "../components/Icon";
import Blossom from "../components/Sakura";
import AgendaView from "./AgendaView";
import CalendarioView from "./CalendarioView";
import ServiciosView from "./ServiciosView";
import ProfesionalesView from "./ProfesionalesView";

const timeFmt = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" });

const TABS = [
  { id: "agenda", label: "Agenda", icon: "list" },
  { id: "calendario", label: "Calendario", icon: "calendar" },
  { id: "servicios", label: "Servicios", icon: "tag" },
  { id: "profesionales", label: "Profesionales", icon: "users" },
];

export default function Dashboard({ session, onLogout }) {
  const [branchId, setBranchId] = useState(locations[0].id);
  const [tab, setTab] = useState("agenda");
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [announcement, setAnnouncement] = useState("");

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
      // No "desde": la agenda muestra todos los turnos, pasados y futuros.
      const [reservasData, serviciosData, profesionalesData] = await Promise.all([
        fetchReservasServicios(branch.negocioId, token),
        fetchServicios(branch.negocioId),
        fetchProfesionales(branch.negocioId),
      ]);
      setReservas(reservasData);
      setServicios(serviciosData);
      setProfesionales(profesionalesData);
      setLastUpdated(new Date());
      setAnnouncement("Datos actualizados.");
    } catch (err) {
      if (err instanceof ReservaError && err.status === 401) {
        onLogout();
        return;
      }
      if (err instanceof ReservaError && err.status === 403) {
        setError("Tu cuenta no tiene acceso a esta sucursal.");
      } else {
        setError("No se pudieron cargar los datos.");
      }
      setReservas([]);
      setServicios([]);
      setProfesionales([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch.negocioId, onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  function handleBranchChange(id) {
    setBranchId(id);
  }

  async function handleConfirmReserva(id) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const updated = await confirmarReservaServicio(id, token);
    setReservas((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function handleCompleteReserva(id) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const updated = await completarReservaServicio(id, token);
    setReservas((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function handleCancelReserva(id) {
    const updated = await cancelarReservaServicio(id);
    setReservas((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  function sortByNombre(list) {
    return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async function handleCreateServicio(dto) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const created = await createServicio(branch.negocioId, token, dto);
    setServicios((prev) => sortByNombre([...prev, created]));
  }

  async function handleUpdateServicio(id, dto) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const updated = await updateServicio(branch.negocioId, id, token, dto);
    setServicios((prev) => sortByNombre(prev.map((s) => (s.id === id ? updated : s))));
  }

  async function handleDeleteServicio(id) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    await removeServicio(branch.negocioId, id, token);
    setServicios((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleCreateProfesional(dto) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const created = await createProfesional(branch.negocioId, token, dto);
    setProfesionales((prev) => sortByNombre([...prev, created]));
  }

  async function handleUpdateProfesional(id, dto) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    const updated = await updateProfesional(branch.negocioId, id, token, dto);
    setProfesionales((prev) => sortByNombre(prev.map((p) => (p.id === id ? updated : p))));
  }

  async function handleDeleteProfesional(id) {
    const token = await getValidAccessToken();
    if (!token) return onLogout();
    await removeProfesional(branch.negocioId, id, token);
    setProfesionales((prev) => prev.filter((p) => p.id !== id));
  }

  // Backend records for the branch, falling back to the static public-site
  // content when a reserva points at a servicio/profesional that was since
  // soft-deleted (findAll only returns activo:true rows, so it would
  // otherwise be missing here and the agenda would show a blank name).
  const servicioById = useMemo(() => {
    const map = {};
    for (const s of servicios) map[s.id] = s;
    for (const r of reservas) {
      if (!map[r.servicioId]) {
        const fallback = serviceByApiId(branchId, r.servicioId);
        if (fallback) map[r.servicioId] = { id: r.servicioId, nombre: fallback.es.name };
      }
    }
    return map;
  }, [servicios, reservas, branchId]);

  const profesionalById = useMemo(() => {
    const map = {};
    for (const p of profesionales) map[p.id] = p;
    for (const r of reservas) {
      if (!map[r.profesionalId]) {
        const fallback = professionalByApiId(r.profesionalId);
        if (fallback) map[r.profesionalId] = { id: r.profesionalId, nombre: fallback.name };
      }
    }
    return map;
  }, [profesionales, reservas]);

  return (
    <div className="admin-dashboard">
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__title">
          <Blossom size={22} />
          <h1>Sakura Bloom — Admin</h1>
        </div>
        <div className="admin-dashboard__session">
          <span>{session.email}</span>
          <button type="button" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>

      <div className="admin-dashboard__toolbar">
        <div className="admin-dashboard__tabs-group">
          <span className="admin-dashboard__tabs-label">Sucursal</span>
          <div className="admin-branch-tabs" role="tablist" aria-label="Sucursal">
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                role="tab"
                aria-selected={branchId === loc.id}
                className={branchId === loc.id ? "is-active" : ""}
                onClick={() => handleBranchChange(loc.id)}
              >
                {loc.es.area}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-dashboard__freshness">
          {lastUpdated && (
            <span className="admin-dashboard__updated">Actualizado {timeFmt.format(lastUpdated)}</span>
          )}
          <button
            type="button"
            className={`admin-dashboard__refresh ${loading ? "is-spinning" : ""}`}
            onClick={load}
            disabled={loading}
            aria-label="Actualizar"
            title="Actualizar"
          >
            <Icon name="refresh" size={15} />
          </button>
        </div>
      </div>

      <nav className="admin-section-tabs" role="tablist" aria-label="Sección">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "is-active" : ""}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="admin-error" role="alert">
          <Icon name="alert" size={15} />
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-empty">Cargando…</p>
      ) : (
        <>
          {tab === "agenda" && (
            <AgendaView
              reservas={reservas}
              servicioById={servicioById}
              profesionalById={profesionalById}
              onConfirm={handleConfirmReserva}
              onComplete={handleCompleteReserva}
              onCancel={handleCancelReserva}
            />
          )}
          {tab === "calendario" && (
            <CalendarioView
              reservas={reservas}
              servicioById={servicioById}
              profesionalById={profesionalById}
              onConfirm={handleConfirmReserva}
              onComplete={handleCompleteReserva}
              onCancel={handleCancelReserva}
            />
          )}
          {tab === "servicios" && (
            <ServiciosView
              servicios={servicios}
              onCreate={handleCreateServicio}
              onUpdate={handleUpdateServicio}
              onDelete={handleDeleteServicio}
            />
          )}
          {tab === "profesionales" && (
            <ProfesionalesView
              profesionales={profesionales}
              onCreate={handleCreateProfesional}
              onUpdate={handleUpdateProfesional}
              onDelete={handleDeleteProfesional}
            />
          )}
        </>
      )}
    </div>
  );
}
