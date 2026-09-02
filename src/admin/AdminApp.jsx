import { useEffect, useState } from "react";
import { getSession, clearSession } from "../lib/adminAuth";
import { attachPreloader } from "../lib/preloader";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./Admin.css";

export default function AdminApp() {
  const [session, setSession] = useState(() => getSession());

  // The loading curtain lives in index.html and only lifts once told to (see
  // preloader.js) — the public site's App.jsx does that, but /admin renders
  // this component instead, so without this call the curtain would sit until
  // its own 6s fallback timeout instead of clearing as soon as this mounts.
  useEffect(attachPreloader, []);

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  return session ? (
    <Dashboard session={session} onLogout={handleLogout} />
  ) : (
    <Login onLogin={setSession} />
  );
}
