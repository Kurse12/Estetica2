import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";

// Lazy-loaded: the admin views (~70KB of the old single bundle, per
// Lighthouse's unused-JS audit) have no reason to ship to every visitor of
// the public site just because they live in the same repo.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

// This one split is all the routing the site does, so it is a pathname check
// rather than react-router, which was ~37KB (12%) of the entry bundle for it.
// Same match the old <Route path="/admin"> made: /admin or /admin/, any case;
// everything else is the public site. vercel.json already rewrites every path
// to index.html, so this runs for deep links too.
const isAdmin = /^\/admin\/?$/i.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
