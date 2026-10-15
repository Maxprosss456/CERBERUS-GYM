import { Fragment, useMemo, useRef, useState } from "react";
import PanelFlotante from "../PanelFlotante.jsx";
import { MESES } from "../../utils/fechas.js";
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

/** "2026-09-27" -> "Septiembre 2026" */
function etiquetaMes(fechaISO) {
  const [anio, mes] = fechaISO.split("-");
  const nombreMes = MESES[Number(mes) - 1];
  return `${nombreMes.charAt(0).toUpperCase()}${nombreMes.slice(1)} ${anio}`;
}

/** "2026-09-27" -> "2026-09", para comparar si dos fechas son del mismo mes. */
function claveMes(fechaISO) {
  return fechaISO.slice(0, 7);
}

export default function Pagos({ pagos, socios, onRegistrarPago }) {
  const [pestanaActiva, setPestanaActiva] = useState("registrado");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("asc"); // "asc" | "desc"
  const [panelMetodoId, setPanelMetodoId] = useState(null);
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [panelFiltroAbierto, setPanelFiltroAbierto] = useState(false);

  const anchorsRef = useRef({});
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

  const filtroMetodoVisible = pestanaActiva === "registrado" && !busqueda;

  const pagosVisibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

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

  // Se arma SIEMPRE a partir de `pagosVisibles` (la misma lista que ya se
  // renderiza abajo), así el total nunca puede desincronizarse de las filas
  // que el dueño está viendo en pantalla. Solo tiene sentido cuando hay un
  // método puntual elegido (con "Todos" no se muestra nada).
  const totalesPorMes = useMemo(() => {
    if (!filtroMetodoVisible || filtroMetodo === "todos") return null;
    const mapa = new Map();
    pagosVisibles.forEach((p) => {
      const clave = claveMes(p.fecha);
      const anterior = mapa.get(clave) ?? { total: 0, cantidad: 0 };
      mapa.set(clave, { total: anterior.total + p.monto, cantidad: anterior.cantidad + 1 });
    });
    return mapa;
  }, [pagosVisibles, filtroMetodoVisible, filtroMetodo]);

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
          pagosVisibles.map((pago, indice) => {
            const mesActual = claveMes(pago.fecha);
            const mesAnterior = indice > 0 ? claveMes(pagosVisibles[indice - 1].fecha) : null;
            const mostrarSeparador = mesActual !== mesAnterior;

            return (
              <Fragment key={pago.id}>
                {mostrarSeparador && (
                  <div className="pagos-separador-mes">
                    <span>{etiquetaMes(pago.fecha)}</span>
                    {totalesPorMes?.has(mesActual) && (
                      <span className="pagos-separador-total">
                        ${totalesPorMes.get(mesActual).total.toLocaleString("es-AR")} ·{" "}
                        {totalesPorMes.get(mesActual).cantidad}{" "}
                        {totalesPorMes.get(mesActual).cantidad === 1 ? "pago" : "pagos"}
                      </span>
                    )}
                  </div>
                )}
                <div className={`pagos-fila pagos-fila-${pago.estado}`}>
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
              </Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}