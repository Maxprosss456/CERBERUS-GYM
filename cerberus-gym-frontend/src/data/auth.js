import { api } from "./api.js";

export function login(usuario, password) {
  return api("/auth/login", { metodo: "POST", cuerpo: { usuario, password } });
}