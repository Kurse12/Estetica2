import { useState } from "react";
import Icon from "../components/Icon";
import { priceFmt } from "../data";

const EMPTY_FORM = { nombre: "", duracionMinutos: "", precio: "", descripcion: "" };

function toFormValues(servicio) {
  if (!servicio) return EMPTY_FORM;
  return {
    nombre: servicio.nombre ?? "",
    duracionMinutos: String(servicio.duracionMinutos ?? ""),
    precio: servicio.precio != null ? String(servicio.precio) : "",
    descripcion: servicio.descripcion ?? "",
  };
}

function toDto(values) {
  const dto = {
    nombre: values.nombre.trim(),
    duracionMinutos: Number(values.duracionMinutos),
  };
  if (values.precio.trim() !== "") dto.precio = Number(values.precio);
  if (values.descripcion.trim() !== "") dto.descripcion = values.descripcion.trim();
  return dto;
}

function validate(values) {
  if (values.nombre.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
  const duracion = Number(values.duracionMinutos);
  if (!Number.isInteger(duracion) || duracion <= 0) return "La duración debe ser un número entero de minutos, mayor a 0.";
  if (values.precio.trim() !== "" && Number(values.precio) < 0) return "El precio no puede ser negativo.";
  return null;
}

export default function ServiciosView({ servicios, onCreate, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null); // "new" | servicio.id | null
  const [values, setValues] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function startCreate() {
    setEditingId("new");
    setValues(EMPTY_FORM);
    setFormError(null);
  }

  function startEdit(servicio) {
    setEditingId(servicio.id);
    setValues(toFormValues(servicio));
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError(null);
  }

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate(values);
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const dto = toDto(values);
      if (editingId === "new") {
        await onCreate(dto);
      } else {
        await onUpdate(editingId, dto);
      }
      setEditingId(null);
    } catch (err) {
      setFormError(err?.message || "No se pudo guardar el servicio.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setConfirmingDeleteId(null);
    setDeleteError(null);
    try {
      await onDelete(id);
    } catch {
      setDeleteError("No se pudo eliminar el servicio. Probá de nuevo.");
    }
  }

  return (
    <div className="admin-crud">
      <div className="admin-crud__toolbar">
        <h2>Servicios</h2>
        {editingId === null && (
          <button type="button" className="admin-crud__add" onClick={startCreate}>
            <Icon name="plus" size={14} />
            Nuevo servicio
          </button>
        )}
      </div>

      {deleteError && (
        <p className="admin-error" role="alert">
          <Icon name="alert" size={15} />
          {deleteError}
        </p>
      )}

      {editingId === "new" && (
        <ServicioForm
          values={values}
          setField={setField}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          error={formError}
          saving={saving}
          title="Nuevo servicio"
        />
      )}

      {servicios.length === 0 ? (
        <p className="admin-empty">Todavía no hay servicios cargados en esta sucursal.</p>
      ) : (
        <ul className="admin-crud-list">
          {servicios.map((s) => (
            <li key={s.id} className="admin-crud-item">
              {editingId === s.id ? (
                <ServicioForm
                  values={values}
                  setField={setField}
                  onSubmit={handleSubmit}
                  onCancel={cancelEdit}
                  error={formError}
                  saving={saving}
                  title="Editar servicio"
                />
              ) : (
                <>
                  <div className="admin-crud-item__main">
                    <div className="admin-crud-item__icon">
                      <Icon name="tag" size={18} />
                    </div>
                    <div>
                      <strong>{s.nombre}</strong>
                      <div className="admin-crud-item__meta">
                        <span>{s.duracionMinutos} min</span>
                        {s.precio != null && <span>${priceFmt.format(Number(s.precio))}</span>}
                      </div>
                      {s.descripcion && <p className="admin-crud-item__desc">{s.descripcion}</p>}
                    </div>
                  </div>
                  <div className="admin-crud-item__actions">
                    {confirmingDeleteId === s.id ? (
                      <div className="admin-reserva__confirm">
                        <span>¿Eliminar?</span>
                        <button
                          type="button"
                          className="admin-reserva__confirm-yes"
                          onClick={() => handleDelete(s.id)}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          className="admin-reserva__confirm-no"
                          onClick={() => setConfirmingDeleteId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button type="button" className="admin-icon-btn" title="Editar" onClick={() => startEdit(s)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          title="Eliminar"
                          onClick={() => setConfirmingDeleteId(s.id)}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ServicioForm({ values, setField, onSubmit, onCancel, error, saving, title }) {
  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <h3>{title}</h3>
      {error && (
        <p className="admin-form__error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
      <div className="admin-form__row">
        <label>
          Nombre
          <input
            type="text"
            value={values.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
            maxLength={120}
            required
          />
        </label>
        <label>
          Duración (min)
          <input
            type="number"
            min="1"
            value={values.duracionMinutos}
            onChange={(e) => setField("duracionMinutos", e.target.value)}
            required
          />
        </label>
        <label>
          Precio
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.precio}
            onChange={(e) => setField("precio", e.target.value)}
          />
        </label>
      </div>
      <label>
        Descripción
        <textarea
          value={values.descripcion}
          onChange={(e) => setField("descripcion", e.target.value)}
          maxLength={1000}
          rows={2}
        />
      </label>
      <div className="admin-form__buttons">
        <button type="button" className="admin-form__cancel" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="admin-form__save" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
