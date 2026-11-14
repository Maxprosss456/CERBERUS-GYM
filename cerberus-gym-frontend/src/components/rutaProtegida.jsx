import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ soloDueno = false }) {
  const { autenticado, rol } = useAuth();
  if (!autenticado) return <Navigate to="/login" replace />;
  if (soloDueno && rol !== "administrador") return <Navigate to="/socios" replace />;
  return <Outlet />;
}