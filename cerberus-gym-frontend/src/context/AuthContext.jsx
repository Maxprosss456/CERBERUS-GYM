import { createContext, useContext, useState } from "react";
import { login } from "../data/auth.js";

const AuthContext = createContext(null);
const CLAVE = "autenticado";

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(
    () => sessionStorage.getItem(CLAVE) === "true"
  );

  async function ingresar(usuario, password) {
    await login(usuario, password); // lanza error si son incorrectos
    sessionStorage.setItem(CLAVE, "true");
    setAutenticado(true);
  }

  function salir() {
    sessionStorage.removeItem(CLAVE);
    setAutenticado(false);
  }

  return (
    <AuthContext.Provider value={{ autenticado, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}