import { api } from "./api.js";

export function cambiarPassword(passwordActual, passwordNueva) {
  return api("/auth/password", { metodo: "PATCH", cuerpo: { passwordActual, passwordNueva } });
}