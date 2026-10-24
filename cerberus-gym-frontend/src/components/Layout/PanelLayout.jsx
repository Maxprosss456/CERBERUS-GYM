import { Outlet } from "react-router-dom";
import "./Layout.css";
import Sidebar from "./Sidebar.jsx";
import { useDatos } from "../../context/datosContext.jsx";

export default function PanelLayout() {
  const { cargando, error } = useDatos();

  return (
    <div className="panel-layout">
      <Sidebar />
      <main className="panel-contenido">
        <div className="panel-tarjeta">
          {cargando ? (
            <p className="app-cargando">Cargando datos…</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}