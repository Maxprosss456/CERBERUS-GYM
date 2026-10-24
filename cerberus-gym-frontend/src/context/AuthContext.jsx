import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  function ingresar(datos) {
    // Mock. Cuando exista el backend, la autenticación real va acá.
    setUsuario(datos);
  }

  function salir() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ autenticado: usuario !== null, usuario, ingresar, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}