import { useState } from "react";
import Icon from "../components/Icon";

const EMPTY_FORM = { nombre: "", descripcion: "" };

function toFormValues(profesional) {
  if (!profesional) return EMPTY_FORM;
  return {
    nombre: profesional.nombre ?? "",
    descripcion: profesional.descripcion ?? "",
  };
}

function toDto(values) {
  const dto = { nombre: values.nombre.trim() };
  if (values.descripcion.trim() !== "") dto.descripcion = values.descripcion.trim();
  return dto;
}

function validate(values) {
  if (values.nombre.trim().length < 2) return "El nombre debe tener al menos 2 caracteres.";
  return null;
}

export default function ProfesionalesView({ profesionales, onCreate, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null); // "new" | profesional.id | null
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

  function startEdit(profesional) {
    setEditingId(profesional.id);
    setValues(toFormValues(profesional));
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
      setFormError(err?.message || "No se pudo guardar el profesional.");
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
      setDeleteError("No se pudo dar de baja al profesional. Probá de nuevo.");
    }
  }

  return (
    <div className="admin-crud">
      <div className="admin-crud__toolbar">
        <h2>Profesionales</h2>
        {editingId === null && (
          <button type="button" className="admin-crud__add" onClick={startCreate}>
            <Icon name="plus" size={14} />
            Dar de alta
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
        <ProfesionalForm
          values={values}
          setField={setField}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          error={formError}
          saving={saving}
          title="Nuevo profesional"
        />
      )}

      {profesionales.length === 0 ? (
        <p className="admin-empty">Todavía no hay profesionales cargados en esta sucursal.</p>
      ) : (
        <ul className="admin-crud-list">
          {profesionales.map((p) => (
            <li key={p.id} className="admin-crud-item">
              {editingId === p.id ? (
                <ProfesionalForm
                  values={values}
                  setField={setField}
                  onSubmit={handleSubmit}
                  onCancel={cancelEdit}
                  error={formError}
                  saving={saving}
                  title="Editar profesional"
                />
              ) : (
                <>
                  <div className="admin-crud-item__main">
                    <div className="admin-crud-item__icon">
                      <Icon name="users" size={18} />
                    </div>
                    <div>
                      <strong>{p.nombre}</strong>
                      {p.descripcion && <p className="admin-crud-item__desc">{p.descripcion}</p>}
                    </div>
                  </div>
                  <div className="admin-crud-item__actions">
                    {confirmingDeleteId === p.id ? (
                      <div className="admin-reserva__confirm">
                        <span>¿Dar de baja?</span>
                        <button
                          type="button"
                          className="admin-reserva__confirm-yes"
                          onClick={() => handleDelete(p.id)}
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
                        <button type="button" className="admin-icon-btn" title="Editar" onClick={() => startEdit(p)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          title="Dar de baja"
                          onClick={() => setConfirmingDeleteId(p.id)}
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

function ProfesionalForm({ values, setField, onSubmit, onCancel, error, saving, title }) {
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
