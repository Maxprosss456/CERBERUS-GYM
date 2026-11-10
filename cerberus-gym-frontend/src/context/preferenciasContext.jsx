import { createContext, useContext, useState } from "react";
import { obtenerDiasAnticipacionGuardado, guardarDiasAnticipacion } from "../utils/preferencias.js";

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const [diasAnticipacion, setDiasAnticipacion] = useState(obtenerDiasAnticipacionGuardado);

  function cambiarDiasAnticipacion(dias) {
    setDiasAnticipacion(dias);
    guardarDiasAnticipacion(dias);
  }

  return (
    <PreferenciasContext.Provider value={{ diasAnticipacion, cambiarDiasAnticipacion }}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) throw new Error("usePreferencias debe usarse dentro de PreferenciasProvider");
  return ctx;
}