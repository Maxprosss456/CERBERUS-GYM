import { useMemo, useState } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import SocioCard from "./SocioCard.jsx";
import AgregarSocioModal from "./AgregarSocioModal.jsx";
import SocioDetalleModal from "./SocioDetalleModal.jsx";
import "./Socios.css";

export default function Socios() {
  const { socios, pagos, agregarSocio, editarSocio, eliminarSocio } = useDatos();

  const [busqueda, setBusqueda] = useState("");
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [socioEnEdicion, setSocioEnEdicion] = useState(null);
  const [error, setError] = useState("");

  const sociosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return socios;
    return socios.filter((s) =>
      `${s.nombre} ${s.apellido} ${s.dni}`.toLowerCase().includes(termino)
    );
  }, [socios, busqueda]);

  async function manejarGuardarAlta(nuevoSocio) {
    try {
      setError("");
      await agregarSocio(nuevoSocio);
      setMostrarAlta(false);
    } catch {
      setError("No se pudo guardar el socio. Intentá de nuevo.");
    }
  }

  async function manejarGuardarEdicion(datosForm) {
    try {
      setError("");
      await editarSocio(socioEnEdicion.id, datosForm);
      setSocioSeleccionado({ ...socioEnEdicion, ...datosForm });
      setSocioEnEdicion(null);
    } catch {
      setError("No se pudieron guardar los cambios. Intentá de nuevo.");
    }
  }

  async function manejarEliminar(id) {
    try {
      setError("");
      await eliminarSocio(id);
      setSocioSeleccionado(null);
    } catch {
      setError("No se pudo eliminar el socio. Intentá de nuevo.");
    }
  }

  function manejarEditar(socio) {
    setSocioEnEdicion(socio);
  }

  return (
    <div className="socios-vista">
      <div className="socios-toolbar">
        <input
          type="search"
          className="socios-buscador"
          placeholder="Buscar Socio"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar socio por nombre o DNI"
        />
        <button className="btn btn-primario" onClick={() => setMostrarAlta(true)}>
          + Agregar Nuevo Socio
        </button>
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