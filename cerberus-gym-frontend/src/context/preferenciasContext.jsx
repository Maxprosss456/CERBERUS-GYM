import { createContext, useContext, useState } from "react";
import {
  obtenerDiasAnticipacionGuardado,
  guardarDiasAnticipacion,
  obtenerPrecioMensualidadGuardado,
  guardarPrecioMensualidad,
} from "../utils/preferencias.js";

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const [diasAnticipacion, setDiasAnticipacion] = useState(obtenerDiasAnticipacionGuardado);
  const [precioMensualidad, setPrecioMensualidad] = useState(obtenerPrecioMensualidadGuardado);

  function cambiarDiasAnticipacion(dias) {
    setDiasAnticipacion(dias);
    guardarDiasAnticipacion(dias);
  }

  function cambiarPrecioMensualidad(precio) {
    setPrecioMensualidad(precio);
    guardarPrecioMensualidad(precio);
  }

  return (
    <PreferenciasContext.Provider
      value={{ diasAnticipacion, cambiarDiasAnticipacion, precioMensualidad, cambiarPrecioMensualidad }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) throw new Error("usePreferencias debe usarse dentro de PreferenciasProvider");
  return ctx;
}