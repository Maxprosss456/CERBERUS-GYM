import { createContext, useContext, useEffect, useState } from "react";
import { login } from "../data/auth.js";

const AuthContext = createContext(null);
const CLAVE = "autenticado";
const CLAVE_ROL = "rol";
const CLAVE_TOKEN = "token";
const CLAVE_ID = "usuarioId";

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(
    () => sessionStorage.getItem(CLAVE) === "true"
  );
  const [rol, setRol] = useState(() => sessionStorage.getItem(CLAVE_ROL));
  const [usuarioId, setUsuarioId] = useState(
    () => Number(sessionStorage.getItem(CLAVE_ID)) || null
  );

  async function ingresar(usuario, password) {
    const datos = await login(usuario, password); // lanza error si son incorrectos
    const rolRecibido = datos?.rol ?? "empleado";
    sessionStorage.setItem(CLAVE, "true");
    sessionStorage.setItem(CLAVE_ROL, rolRecibido);
    sessionStorage.setItem(CLAVE_TOKEN, datos.token);
    sessionStorage.setItem(CLAVE_ID, String(datos.id));
    setRol(rolRecibido);
    setUsuarioId(datos.id);
    setAutenticado(true);
  }

  function salir() {
    sessionStorage.removeItem(CLAVE);
    sessionStorage.removeItem(CLAVE_ROL);
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_ID);
    setRol(null);
    setUsuarioId(null);
    setAutenticado(false);
  }

  useEffect(() => {
    window.addEventListener("sesion-expirada", salir);
    return () => window.removeEventListener("sesion-expirada", salir);
  }, []);

  return (
    <AuthContext.Provider value={{ autenticado, rol, usuarioId, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}