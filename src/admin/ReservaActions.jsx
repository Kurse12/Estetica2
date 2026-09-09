import { useState } from "react";
import Icon from "../components/Icon";
import { ESTADO_LABELS, whatsappLink } from "./adminFormat";

const ESTADO_BADGE_CLASS = {
  pendiente: "admin-badge--pendiente",
  confirmada: "admin-badge--confirmada",
  realizada: "admin-badge--realizada",
  cancelada: "admin-badge--cancelled",
};

// The status badge + the confirm/complete/cancel/WhatsApp button cluster for
// one reserva. Self-contained (owns its own busy/confirm-inline state) so
// both the agenda list and the calendar's day panel can render a row without
// duplicating this logic.
export default function ReservaActions({ reserva, servicioNombre, onConfirm, onComplete, onCancel }) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [error, setError] = useState(null);

  const wsp = whatsappLink(reserva, servicioNombre);

  async function run(action, fn) {
    setBusyAction(action);
    setError(null);
    try {
      await fn(reserva.id);
    } catch {
      setError(action === "cancel" ? "No se pudo cancelar. Probá de nuevo." : "No se pudo actualizar. Probá de nuevo.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <div className="admin-reserva__status">
        <span className={`admin-badge ${ESTADO_BADGE_CLASS[reserva.estado] ?? ""}`}>
          {ESTADO_LABELS[reserva.estado] ?? reserva.estado}
        </span>
      </div>
      <div className="admin-reserva__actions">
        {confirmingCancel ? (
          <div className="admin-reserva__confirm">
            <span>¿Cancelar?</span>
            <button
              type="button"
              className="admin-reserva__confirm-yes"
              aria-label={`Confirmar cancelación de la reserva de ${reserva.clienteNombre}`}
              onClick={() => {
                setConfirmingCancel(false);
                run("cancel", onCancel);
              }}
            >
              Sí
            </button>
            <button
              type="button"
              className="admin-reserva__confirm-no"
              aria-label={`Mantener la reserva de ${reserva.clienteNombre}`}
              onClick={() => setConfirmingCancel(false)}
            >
              No
            </button>
          </div>
        ) : (
          <div className="admin-reserva__buttons">
            {wsp && (
              <a
                href={wsp}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-action admin-action--wsp"
                title="Escribir por WhatsApp"
              >
                <Icon name="chat" size={14} />
                WhatsApp
              </a>
            )}
            {reserva.estado === "pendiente" && (
              <button
                type="button"
                className="admin-action admin-action--confirm"
                disabled={!!busyAction}
                onClick={() => run("confirm", onConfirm)}
              >
                {busyAction === "confirm" ? "Confirmando…" : "Confirmar"}
              </button>
            )}
            {reserva.estado === "confirmada" && (
              <button
                type="button"
                className="admin-action admin-action--complete"
                disabled={!!busyAction}
                onClick={() => run("complete", onComplete)}
              >
                {busyAction === "complete" ? "Completando…" : "Completar"}
              </button>
            )}
            {(reserva.estado === "pendiente" || reserva.estado === "confirmada") && (
              <button
                type="button"
                className="admin-action admin-action--cancel"
                disabled={!!busyAction}
                onClick={() => setConfirmingCancel(true)}
              >
                Cancelar
              </button>
            )}
          </div>
        )}
        {error && (
          <p className="admin-reserva__row-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
