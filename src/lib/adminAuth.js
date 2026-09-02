// Login for the admin route, talking to Supabase Auth directly (the backend
// has no login endpoint of its own — see API.md "Autenticación"). The
// session is kept in localStorage and refreshed on demand so the dashboard
// can stay open across reloads without asking for the password again.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_KEY = "sakura_admin_session";

export class AuthError extends Error {}

// Supabase's own copy is English-only; the rest of the admin UI is Spanish,
// so the handful of messages an owner will actually hit get translated here.
const KNOWN_MESSAGES = {
  "Invalid login credentials": "Email o contraseña incorrectos.",
  "Email not confirmed": "Todavía no confirmaste tu email.",
};

function readMessage(body) {
  const raw = body?.error_description || body?.msg || body?.error || "Error de autenticación";
  return KNOWN_MESSAGES[raw] ?? raw;
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new AuthError(readMessage(body));
  const session = {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
    email: body.user?.email ?? email,
  };
  saveSession(session);
  return session;
}

async function refresh(refreshToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return null;
  const body = await res.json();
  const session = {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
    email: body.user?.email,
  };
  saveSession(session);
  return session;
}

// Called before every authenticated request rather than on a timer: an
// admin dashboard left open for hours should not silently start failing.
export async function getValidAccessToken() {
  const session = getSession();
  if (!session) return null;
  if (session.expiresAt - Date.now() > 30_000) return session.accessToken;
  const refreshed = await refresh(session.refreshToken);
  if (!refreshed) {
    clearSession();
    return null;
  }
  return refreshed.accessToken;
}
