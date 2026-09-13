import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import App from "./App.jsx";

// Lazy-loaded: the admin views (~70KB of the old single bundle, per
// Lighthouse's unused-JS audit) have no reason to ship to every visitor of
// the public site just because they live in the same repo.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
