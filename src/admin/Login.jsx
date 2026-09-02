import { useState } from "react";
import { login, AuthError } from "../lib/adminAuth";
import Icon from "../components/Icon";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await login(email.trim(), password);
      onLogin(session);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1>Sakura Bloom — Administración</h1>
        <p className="admin-login__hint">Ingresá con tu cuenta de dueño o staff.</p>

        {error && (
          <p className="admin-login__error" role="alert">
            <Icon name="alert" size={15} />
            {error}
          </p>
        )}

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="admin-password">Contraseña</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
