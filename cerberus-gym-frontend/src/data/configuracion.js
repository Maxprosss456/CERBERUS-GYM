import { api } from "./api.js";

export function obtenerConfiguracion() {
  return api("/mensualidad");
}

export function actualizarPrecioMensualidad(mensualidad) {
  return api("/mensualidad", { metodo: "PATCH", cuerpo: { mensualidad } });
}