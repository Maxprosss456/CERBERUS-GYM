import "./Layout.css";
import Sidebar from "./Sidebar.jsx";

export default function PanelLayout({ vistaActiva, onCambiarVista, onSalir, children }) {
  return (
    <div className="panel-layout">
      <Sidebar vistaActiva={vistaActiva} onCambiarVista={onCambiarVista} onSalir={onSalir} />
      <main className="panel-contenido">
        <div className="panel-tarjeta">{children}</div>
      </main>
    </div>
  );
}
