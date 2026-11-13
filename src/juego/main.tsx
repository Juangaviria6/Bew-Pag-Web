import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import { Juego } from "./Juego";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Juego />
  </StrictMode>,
);
