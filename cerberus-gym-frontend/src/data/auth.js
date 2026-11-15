import { api } from "./api.js";

export function login(usuario, password) {
  return api("/auth/login", { metodo: "POST", cuerpo: { usuario, password } });
}

export function cambiarPassword(passwordActual, passwordNueva) {
  return api("/auth/password", { metodo: "PATCH", cuerpo: { passwordActual, passwordNueva } });
}