import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import ReservaActions from "./ReservaActions";
import { dateTimeFmt, ESTADOS, ESTADO_LABELS } from "./adminFormat";

export default function AgendaView({
  reservas,
  servicioById,
  profesionalById,
  onConfirm,
  onComplete,
  onCancel,
}) {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroProfesionalId, setFiltroProfesionalId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [search, setSearch] = useState("");

  const hasFilters = filtroEstado !== "todos" || filtroProfesionalId || desde || hasta || search;

  const profesionalOptions = useMemo(
    () => Object.values(profesionalById).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [profesionalById]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservas
      .filter((r) => {
        if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
        if (filtroProfesionalId && r.profesionalId !== filtroProfesionalId) return false;
        if (desde && new Date(r.inicio) < new Date(`${desde}T00:00:00`)) return false;
        if (hasta && new Date(r.inicio) > new Date(`${hasta}T23:59:59`)) return false;
        if (q) {
          const haystack = `${r.clienteNombre} ${r.clienteEmail} ${r.clienteTelefono ?? ""}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  }, [reservas, filtroEstado, filtroProfesionalId, desde, hasta, search]);

  function clearFilters() {
    setFiltroEstado("todos");
    setFiltroProfesionalId("");
    setDesde("");
    setHasta("");
    setSearch("");
  }

  return (
    <div className="admin-agenda">
      <div className="admin-filters">
        <div className="admin-filters__field">
          <label htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {ESTADO_LABELS[estado]}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filters__field">
          <label htmlFor="filtro-profesional">Profesional</label>
          <select
            id="filtro-profesional"
            value={filtroProfesionalId}
            onChange={(e) => setFiltroProfesionalId(e.target.value)}
          >
            <option value="">Todos</option>
            {profesionalOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filters__field">
          <label htmlFor="filtro-desde">Desde</label>
          <input id="filtro-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>

        <div className="admin-filters__field">
          <label htmlFor="filtro-hasta">Hasta</label>
          <input id="filtro-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>

        <div className="admin-filters__field admin-filters__field--grow">
          <label htmlFor="filtro-buscar">Buscar cliente</label>
          <div className="admin-filters__search">
            <Icon name="search" size={14} />
            <input
              id="filtro-buscar"
              type="text"
              placeholder="Nombre, email o teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {hasFilters && (
          <button type="button" className="admin-filters__clear" onClick={clearFilters}>
            <Icon name="close" size={13} />
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay turnos que coincidan con los filtros.</p>
      ) : (
        <ul className="admin-reserva-list">
          {filtered.map((r) => {
            const profesional = profesionalById[r.profesionalId];
            const servicio = servicioById[r.servicioId];

            return (
              <li key={r.id} className={`admin-reserva ${r.estado === "cancelada" ? "is-cancelled" : ""}`}>
                <div className="admin-reserva__when">
                  <Icon name="calendar" size={16} />
                  {dateTimeFmt.format(new Date(r.inicio))}
                </div>
                <div className="admin-reserva__what">
                  <strong>{servicio?.nombre ?? "Servicio"}</strong>
                  <span> con {profesional?.nombre ?? "—"}</span>
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
                <ReservaActions
                  reserva={r}
                  servicioNombre={servicio?.nombre}
                  onConfirm={onConfirm}
                  onComplete={onComplete}
                  onCancel={onCancel}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
