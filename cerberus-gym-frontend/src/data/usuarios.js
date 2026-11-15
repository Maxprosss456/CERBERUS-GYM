import { api } from "./api.js";

export function listarUsuarios() {
  return api("/usuarios");
}

export function crearUsuario({ usuario, password, rol }) {
  return api("/usuarios", { metodo: "POST", cuerpo: { usuario, password, rol } });
}

export function actualizarUsuario(id, cambios) {
  return api(`/usuarios/${id}`, { metodo: "PATCH", cuerpo: cambios });
}

export function borrarUsuario(id) {
  return api(`/usuarios/${id}`, { metodo: "DELETE" });
}