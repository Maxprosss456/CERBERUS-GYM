import { api } from "./api.js";

export function obtenerConfiguracion() {
  return api("/configuracion");
}

export function actualizarPrecioMensualidad(mensualidad) {
  return api("/configuracion", { metodo: "PATCH", cuerpo: { mensualidad } });
}