import { useMemo, useState } from "react";
import SocioCard from "./SocioCard.jsx";
import AgregarSocioModal from "./AgregarSocioModal.jsx";
import SocioDetalleModal from "./SocioDetalleModal.jsx";
import "./Socios.css";

export default function Socios({ socios, pagos, onAgregarSocio, onEditarSocio, onEliminarSocio }) {
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [socioEnEdicion, setSocioEnEdicion] = useState(null);

  const sociosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return socios;
    return socios.filter((s) =>
      `${s.nombre} ${s.apellido} ${s.dni}`.toLowerCase().includes(termino)
    );
  }, [socios, busqueda]);

  function manejarGuardarAlta(nuevoSocio) {
    onAgregarSocio(nuevoSocio);
    setMostrarAlta(false);
  }

  function manejarGuardarEdicion(datosForm) {
    onEditarSocio(socioEnEdicion.id, datosForm);
    setSocioSeleccionado({ ...socioEnEdicion, ...datosForm });
    setSocioEnEdicion(null);
  }

  function manejarEliminar(id) {
    onEliminarSocio(id);
    setSocioSeleccionado(null);
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
