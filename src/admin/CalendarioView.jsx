import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import ReservaActions from "./ReservaActions";
import { addMonths, dateToISO, getMonthGrid, isSameDay, startOfMonth } from "../lib/availability";
import { dayFmt, timeFmt } from "./adminFormat";

const MONTH_FMT = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarioView({ reservas, servicioById, profesionalById, onConfirm, onComplete, onCancel }) {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const reservasByDay = useMemo(() => {
    const map = new Map();
    for (const r of reservas) {
      if (r.estado === "cancelada") continue;
      const key = dateToISO(new Date(r.inicio));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [reservas]);

  const grid = useMemo(() => getMonthGrid(monthDate), [monthDate]);
  const selectedKey = dateToISO(selectedDate);
  const dayReservas = (reservasByDay.get(selectedKey) ?? []).sort(
    (a, b) => new Date(a.inicio) - new Date(b.inicio)
  );

  function goToMonth(offset) {
    setMonthDate((prev) => addMonths(prev, offset));
  }

  return (
    <div className="admin-calendar">
      <div className="admin-calendar__grid-wrap">
        <div className="admin-calendar__header">
          <button type="button" onClick={() => goToMonth(-1)} aria-label="Mes anterior">
            <Icon name="chevronLeft" size={16} />
          </button>
          <strong>{MONTH_FMT.format(monthDate)}</strong>
          <button type="button" onClick={() => goToMonth(1)} aria-label="Mes siguiente">
            <Icon name="chevronRight" size={16} />
          </button>
        </div>

        <div className="admin-calendar__weekdays">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="admin-calendar__days">
          {grid.map(({ date, inMonth }) => {
            const key = dateToISO(date);
            const count = reservasByDay.get(key)?.length ?? 0;
            const isSelected = isSameDay(date, selectedDate);
            return (
              <button
                type="button"
                key={key}
                className={[
                  "admin-calendar__day",
                  !inMonth && "is-outside",
                  isSelected && "is-selected",
                  count > 0 && "has-turnos",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDate(date)}
              >
                <span>{date.getDate()}</span>
                {count > 0 && <span className="admin-calendar__dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-calendar__day-panel">
        <h2>{dayFmt.format(selectedDate)}</h2>
        {dayReservas.length === 0 ? (
          <p className="admin-empty">No hay turnos ese día.</p>
        ) : (
          <ul className="admin-reserva-list admin-reserva-list--compact">
            {dayReservas.map((r) => {
              const profesional = profesionalById[r.profesionalId];
              const servicio = servicioById[r.servicioId];
              return (
                <li key={r.id} className="admin-reserva admin-reserva--compact">
                  <div className="admin-reserva__when">
                    <Icon name="clock" size={16} />
                    {timeFmt.format(new Date(r.inicio))}
                  </div>
                  <div className="admin-reserva__what">
                    <strong>{servicio?.nombre ?? "Servicio"}</strong>
                    <span> con {profesional?.nombre ?? "—"}</span>
                  </div>
                  <div className="admin-reserva__who">
                    <span>{r.clienteNombre}</span>
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
    </div>
  );
}
