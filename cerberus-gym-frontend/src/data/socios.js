import { api } from "./api.js";

export function obtenerSocios() {
  return api("/socios");
}

export function crearSocio(nuevoSocio) {
  return api("/socios", { metodo: "POST", cuerpo: nuevoSocio });
}

export function actualizarSocio(id, cambios) {
  return api(`/socios/${id}`, { metodo: "PATCH", cuerpo: cambios });
}

export function eliminarSocio(id) {
  return api(`/socios/${id}`, { metodo: "DELETE" });
}