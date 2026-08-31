import "./Layout.css";
import logo from "../../assets/logo-cerberus.png";

const ITEMS = [
  { id: "socios", label: "Socios" },
  { id: "pagos", label: "Pagos" },
  { id: "calendario", label: "Calendario" },
  { id: "configuracion", label: "Configuración" },
];

export default function Sidebar({ vistaActiva, onCambiarVista, onSalir }) {
  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-marca">
        <img src={logo} alt="" className="sidebar-logo" />
        <span className="sidebar-nombre">CERBERUS GYM</span>
      </div>

      <ul className="sidebar-lista">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={
                "sidebar-item" + (vistaActiva === item.id ? " sidebar-item-activo" : "")
              }
              onClick={() => onCambiarVista(item.id)}
              aria-current={vistaActiva === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <button className="sidebar-salir" onClick={onSalir}>
        Salir
      </button>
    </nav>
  );
}
