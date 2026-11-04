import { useMemo, useState } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import SocioCard from "./SocioCard.jsx";
import AgregarSocioModal from "./AgregarSocioModal.jsx";
import SocioDetalleModal from "./SocioDetalleModal.jsx";
import "./Socios.css";

const estaActivo = (socio) =>
  socio.activo !== false || socio.activo !== 0 || socio.activo !== "false";

export default function Socios() {
  const { socios, pagos, agregarSocio, editarSocio, eliminarSocio } = useDatos();

  const [vista, setVista] = useState("activos"); // "activos" | "bajas"
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [socioEnEdicion, setSocioEnEdicion] = useState(null);
  const [error, setError] = useState("");
  const sociosActivos = useMemo(() => socios.filter(estaActivo), [socios]);
  const sociosDeBaja = useMemo(() => socios.filter((s) => !estaActivo(s)), [socios]);

  const sociosFiltrados = useMemo(() => {
    const base = vista === "activos" ? sociosActivos : sociosDeBaja;
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return base;
    return base.filter((s) =>
      `${s.nombre} ${s.apellido} ${s.dni}`.toLowerCase().includes(termino)
    );
  }, [vista, sociosActivos, sociosDeBaja, busqueda]);

  async function manejarGuardarAlta(nuevoSocio) {
    await agregarSocio(nuevoSocio);
    setMostrarAlta(false);
  }
  
  const estadisticas = useMemo(() => {
    // Las cuotas de socios dados de baja no deben contarse
    const idsActivos = new Set(sociosActivos.map((s) => s.id));
    const pagosActivos = pagos.filter((p) => idsActivos.has(p.socioId));

    return [
      { label: "Total de socios", valor: sociosActivos.length },
      { label: "Dados de baja", valor: sociosDeBaja.length },
      {
        label: "Cuotas vencidas",
        valor: pagosActivos.filter((p) => p.estado === "pendiente").length,
      },
      {
        label: "Cuotas próximas",
        valor: pagosActivos.filter((p) => p.estado === "proximo").length,
      },
      {
        label: "Cuotas pagadas",
        valor: pagosActivos.filter((p) => p.estado === "registrado").length,
      },
    ];
  }, [sociosActivos, sociosDeBaja, pagos]);

  async function manejarGuardarEdicion(datosForm) {
    await editarSocio(socioEnEdicion.id, datosForm);
    setSocioSeleccionado({ ...socioEnEdicion, ...datosForm });
    setSocioEnEdicion(null);
  }

  async function manejarEliminar(id) {
    await eliminarSocio(id);
    setSocioSeleccionado(null);
  }

  function manejarEditar(socio) {
    setSocioEnEdicion(socio);
  }

  return (
    <div className="socios-vista">
      <div className="socios-estadisticas">
        {estadisticas.map((item) => (
          <div className="stat-card" key={item.label}>
            <span className="stat-label">{item.label}</span>
            <strong className="stat-valor">{item.valor}</strong>
          </div>
        ))}
      </div>

      <div className="socios-toolbar">
        <div className="socios-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={vista === "activos"}
            className={`btn ${vista === "activos" ? "btn-primario" : ""}`}
            onClick={() => setVista("activos")}
          >
            Activos ({sociosActivos.length})
          </button>
          <button
            role="tab"
            aria-selected={vista === "bajas"}
            className={`btn ${vista === "bajas" ? "btn-primario" : ""}`}
            onClick={() => setVista("bajas")}
          >
            Dados de baja ({sociosDeBaja.length})
          </button>
        </div>

        <input
          type="search"
          className="socios-buscador"
          placeholder="Buscar socio por nombre o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar socio por nombre o DNI"
        />

        {vista === "activos" && (
          <button className="btn btn-primario" onClick={() => setMostrarAlta(true)}>
            + Agregar Nuevo Socio
          </button>
        )}
      </div>

      {error && (
        <p className="socios-error" role="alert">
          {error}
        </p>
      )}

      {sociosFiltrados.length === 0 ? (
        <p className="socios-vacio">No se encontraron socios con ese criterio.</p>
      ) : (
        <div className="socios-grilla">
          {sociosFiltrados.map((socio) => (
            <SocioCard key={socio.id} socio={socio} onClick={setSocioSeleccionado} />
          ))}
        </div>
      )}

      {mostrarAlta && (
        <AgregarSocioModal
          onCerrar={() => setMostrarAlta(false)}
          onGuardar={manejarGuardarAlta}
        />
      )}

      {socioEnEdicion && (
        <AgregarSocioModal
          socioInicial={socioEnEdicion}
          onCerrar={() => setSocioEnEdicion(null)}
          onGuardar={manejarGuardarEdicion}
        />
      )}

      {socioSeleccionado && !socioEnEdicion && (
        <SocioDetalleModal
          socio={socioSeleccionado}
          pagosDelSocio={pagos.filter((p) => p.socioId === socioSeleccionado.id)}
          onCerrar={() => setSocioSeleccionado(null)}
          onEditar={manejarEditar}
          onEliminar={manejarEliminar}
        />
      )}
    </div>
  );
}