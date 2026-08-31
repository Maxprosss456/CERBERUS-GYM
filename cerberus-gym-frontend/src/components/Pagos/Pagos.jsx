import { useMemo, useRef, useState } from "react";
import PanelFlotante from "../PanelFlotante.jsx";
import "./Pagos.css";

const PESTANAS = [
  { id: "registrado", label: "Registros" },
  { id: "proximo", label: "Próximos" },
  { id: "pendiente", label: "Pendientes" },
];

const ETIQUETA_ESTADO = {
  pendiente: "Vencido",
  proximo: "Por vencer",
  registrado: "Pagado",
};

const OPCIONES_FILTRO_METODO = [
  { id: "todos", label: "Todos" },
  { id: "Efectivo", label: "Efectivo" },
  { id: "Transferencia", label: "Transferencia" },
];

export default function Pagos({ pagos, socios, onRegistrarPago }) {
  const [pestanaActiva, setPestanaActiva] = useState("registrado");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("asc"); // "asc" | "desc"
  const [panelMetodoId, setPanelMetodoId] = useState(null);
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [panelFiltroAbierto, setPanelFiltroAbierto] = useState(false);

  // Un botón "disparador" por fila (sirve tanto para el botón de
  // estado en Pendientes/Próximos como para "Modificar" en Registros),
  // para que el panel flotante de esa fila sepa contra qué anclarse.
  const anchorsRef = useRef({});
  // Disparador del filtro de método (uno solo, vive en la toolbar).
  const filtroAnchorRef = useRef(null);

  const socioPorId = useMemo(() => {
    const mapa = new Map();
    socios.forEach((s) => mapa.set(s.id, s));
    return mapa;
  }, [socios]);

  function nombreDe(pago) {
    const socio = socioPorId.get(pago.socioId);
    return socio ? `${socio.nombre} ${socio.apellido}` : "Socio eliminado";
  }

  // El filtro de método solo tiene sentido en Registros (es el único
  // lugar donde un pago ya tiene un método asignado) y solo cuando no
  // hay búsqueda activa (la búsqueda ya cruza las 3 pestañas por sí sola).
  const filtroMetodoVisible = pestanaActiva === "registrado" && !busqueda;

  const pagosVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    // Con búsqueda activa: cruza las 3 pestañas, sin importar cuál esté
    // seleccionada, así se encuentra al socio esté donde esté.
    let base = termino
      ? pagos.filter((p) => nombreDe(p).toLowerCase().includes(termino))
      : pagos.filter((p) => p.estado === pestanaActiva);

    if (filtroMetodoVisible && filtroMetodo !== "todos") {
      base = base.filter((p) => p.metodo === filtroMetodo);
    }

    const factor = orden === "asc" ? 1 : -1;
    return [...base].sort((a, b) => factor * a.fecha.localeCompare(b.fecha));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagos, pestanaActiva, busqueda, orden, socioPorId, filtroMetodo, filtroMetodoVisible]);

  function manejarElegirMetodo(pagoId, metodo) {
    onRegistrarPago(pagoId, metodo);
    setPanelMetodoId(null);
  }

  function alternarPanel(pagoId) {
    setPanelMetodoId((prev) => (prev === pagoId ? null : pagoId));
  }

  function manejarElegirFiltro(metodoId) {
    setFiltroMetodo(metodoId);
    setPanelFiltroAbierto(false);
  }

  const etiquetaFiltroActivo =
    OPCIONES_FILTRO_METODO.find((o) => o.id === filtroMetodo)?.label ?? "Todos";

  return (
    <div className="pagos-vista">
      <div className="pagos-toolbar">
        <input
          type="search"
          className="pagos-buscador"
          placeholder="Buscar socio en cualquier sección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar pago por nombre de socio"
        />
        <button
          type="button"
          className="btn btn-secundario pagos-orden-boton"
          onClick={() => setOrden((o) => (o === "asc" ? "desc" : "asc"))}
          title="Cambiar orden por fecha"
        >
          Fecha {orden === "asc" ? "↑ Ascendente" : "↓ Descendente"}
        </button>

        {filtroMetodoVisible && (
          <div className="pagos-filtro-metodo">
            <button
              ref={filtroAnchorRef}
              type="button"
              className="btn btn-secundario pagos-orden-boton"
              onClick={() => setPanelFiltroAbierto((prev) => !prev)}
              title="Filtrar por método de pago"
            >
              Método: {etiquetaFiltroActivo}
            </button>

            {panelFiltroAbierto && (
              <PanelFlotante
                anchorRef={filtroAnchorRef}
                onCerrar={() => setPanelFiltroAbierto(false)}
                direccion="abajo"
              >
                <p className="panel-flotante-titulo">Filtrar por método</p>
                <div className="panel-flotante-opciones">
                  {OPCIONES_FILTRO_METODO.map((opcion) => (
                    <button
                      key={opcion.id}
                      className={
                        "btn btn-secundario" +
                        (filtroMetodo === opcion.id ? " pagos-filtro-opcion-activa" : "")
                      }
                      onClick={() => manejarElegirFiltro(opcion.id)}
                    >
                      {opcion.label}
                    </button>
                  ))}
                </div>
              </PanelFlotante>
            )}
          </div>
        )}
      </div>

      <div className="pagos-pestanas">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            className={
              "pagos-pestana" +
              (!busqueda && pestanaActiva === pestana.id ? " pagos-pestana-activa" : "")
            }
            onClick={() => {
              setBusqueda("");
              setPestanaActiva(pestana.id);
            }}
          >
            {pestana.label}
          </button>
        ))}
      </div>

      {busqueda && (
        <p className="pagos-busqueda-info">
          Mostrando resultados de "{busqueda}" en las 3 secciones.
        </p>
      )}

      <div className="pagos-lista">
        {pagosVisibles.length === 0 ? (
          <p className="pagos-vacio">No hay pagos para mostrar.</p>
        ) : (
          pagosVisibles.map((pago) => (
            <div key={pago.id} className={`pagos-fila pagos-fila-${pago.estado}`}>
              <span className="pagos-fecha">{pago.fecha}</span>
              <span className="pagos-nombre">{nombreDe(pago)}</span>
              <span className="pagos-monto">${pago.monto.toLocaleString("es-AR")}</span>

              <div className="pagos-accion">
                {pago.estado === "registrado" ? (
                  <div className="pagos-metodo-info">
                    <span className="pagos-metodo-texto">{pago.metodo}</span>
                    <button
                      ref={(el) => {
                        anchorsRef.current[pago.id] = el;
                      }}
                      className="pagos-modificar-boton"
                      onClick={() => alternarPanel(pago.id)}
                    >
                      Modificar
                    </button>
                  </div>
                ) : (
                  <button
                    ref={(el) => {
                      anchorsRef.current[pago.id] = el;
                    }}
                    className="pagos-estado-label pagos-metodo-boton"
                    onClick={() => alternarPanel(pago.id)}
                  >
                    {ETIQUETA_ESTADO[pago.estado]}
                  </button>
                )}

                {panelMetodoId === pago.id && (
                  <PanelFlotante
                    anchorRef={{ current: anchorsRef.current[pago.id] }}
                    onCerrar={() => setPanelMetodoId(null)}
                  >
                    <p className="panel-flotante-titulo">
                      {pago.estado === "registrado"
                        ? "Corregir método de pago"
                        : "Registrar método de pago"}
                    </p>
                    <div className="panel-flotante-opciones">
                      <button
                        className="btn btn-secundario"
                        onClick={() => manejarElegirMetodo(pago.id, "Efectivo")}
                      >
                        Efectivo
                      </button>
                      <button
                        className="btn btn-secundario"
                        onClick={() => manejarElegirMetodo(pago.id, "Transferencia")}
                      >
                        Transferencia
                      </button>
                    </div>
                  </PanelFlotante>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}