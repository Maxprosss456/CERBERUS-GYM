import { NavLink } from "react-router-dom";
import "./Layout.css";
import logo from "../../assets/logo-cerberus.png";
import { useAuth } from "../../context/AuthContext.jsx";

const ITEMS = [
  { id: "socios", label: "Socios" },
  { id: "pagos", label: "Pagos" },
  { id: "calendario", label: "Calendario" },
  { id: "configuracion", label: "Configuración" },
];

export default function Sidebar() {
  const { salir } = useAuth();

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-marca">
        <img src={logo} alt="" className="sidebar-logo" />
        <span className="sidebar-nombre">CERBERUS GYM</span>
      </div>

      <ul className="sidebar-lista">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <NavLink
              to={`/${item.id}`}
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " sidebar-item-activo" : "")
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button className="sidebar-salir" onClick={salir}>
        Salir
      </button>
    </nav>
  );
}