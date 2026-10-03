import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "lenis/dist/lenis.css";
import "./styles/globals.css";
import App from "./App";
import { initAnalytics } from "./lib/analytics";

// GTM / GA4 con Consent Mode v2 (no hace nada si no hay IDs configurados)
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
