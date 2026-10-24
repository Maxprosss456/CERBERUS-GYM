import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login.jsx";
import PanelLayout from "./components/Layout/PanelLayout.jsx";
import RutaProtegida from "./components/rutaProtegida.jsx";
import Socios from "./components/Socios/Socios.jsx";
import Pagos from "./components/Pagos/Pagos.jsx";
import Calendario from "./components/Calendario/Calendario.jsx";
import Configuracion from "./components/Configuracion/Configuracion.jsx";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route element={<PanelLayout />}>
          <Route path="socios" element={<Socios />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/socios" replace />} />
    </Routes>
  );
}