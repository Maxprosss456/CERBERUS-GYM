import { Fragment, useMemo, useRef, useState } from "react";
import PanelFlotante from "../PanelFlotante.jsx";
import { useDatos } from "../../context/datosContext.jsx";
import { MESES } from "../../utils/fechas.js";
import { partesDelPago } from "../../utils/metodosPago.js";
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

export default function Pagos() {
  const { pagos, socios, registrarPago, deshacerPago } = useDatos();
  const [pestanaActiva, setPestanaActiva] = useState("registrado");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("desc"); // "asc" | "desc"
  const [panelMetodoId, setPanelMetodoId] = useState(null);
  const [filtroMetodo, setFiltroMetodo] = useState("todos");
  const [panelFiltroAbierto, setPanelFiltroAbierto] = useState(false);
  const [modoMixto, setModoMixto] = useState(false);
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [error, setError] = useState("");

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
      base = base.filter((p) => partesDelPago(p).some((parte) => parte.metodo === filtroMetodo));
    }

    const factor = orden === "asc" ? 1 : -1;
    return [...base].sort((a, b) => factor * a.fecha.localeCompare(b.fecha));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagos, pestanaActiva, busqueda, orden, socioPorId, filtroMetodo, filtroMetodoVisible]);

  function cerrarPanel() {
    setPanelMetodoId(null);
    setModoMixto(false);
    setMontoEfectivo("");
  }

  async function manejarElegirMetodo(pagoId, metodo) {
  try {
    setError("");
    await registrarPago(pagoId, metodo);
    cerrarPanel();
  } catch {
    setError("No se pudo registrar el pago. Intentá de nuevo.");
  }
}

async function manejarDeshacer(pagoId) {
  try {
    setError("");
    await deshacerPago(pagoId);
    cerrarPanel();
  } catch {
    setError("No se pudo deshacer el pago. Intentá de nuevo.");
  }
}

async function confirmarMixto(pago) {
  const { valido, efectivo, resto } = calcularMixto(pago);
  if (!valido) return;
  try {
    setError("");
    await registrarPago(pago.id, "Mixto", [
      { metodo: "Efectivo", monto: efectivo },
      { metodo: "Transferencia", monto: resto },
    ]);
    cerrarPanel();
  } catch {
    setError("No se pudo registrar el pago mixto. Intentá de nuevo.");
  }
}

  function alternarPanel(pagoId) {
    setModoMixto(false);
    setMontoEfectivo("");
    setPanelMetodoId((prev) => (prev === pagoId ? null : pagoId));
  }

  function abrirMixto(pago) {
    // Si el pago ya era mixto, precarga el efectivo que tenía.
    const partes = partesDelPago(pago);
    const efectivo = partes.length > 1 ? partes.find((p) => p.metodo === "Efectivo") : null;
    setMontoEfectivo(efectivo ? String(efectivo.monto) : "");
    setModoMixto(true);
  }

  function calcularMixto(pago) {
    const efectivo = Number(montoEfectivo);
    const valido = Number.isInteger(efectivo) && efectivo > 0 && efectivo < pago.monto;
    let aviso = "";
    if (montoEfectivo !== "" && !valido) {
      aviso =
        efectivo >= pago.monto
          ? "Si pagó todo en efectivo, usá el botón Efectivo."
          : "Ingresá un monto en efectivo mayor a 0 y menor al total.";
    }
    return { valido, efectivo, resto: valido ? pago.monto - efectivo : null, aviso };
  }

  function renderFormMixto(pago) {
    const { valido, resto, aviso } = calcularMixto(pago);
    return (
      <>
        <p className="panel-flotante-titulo">Pago mixto</p>
        <p className="pagos-mixto-total">Total a pagar: ${pago.monto.toLocaleString("es-AR")}</p>
        <label className="pagos-mixto-campo">
          Pagó en efectivo
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={montoEfectivo}
            onChange={(e) => setMontoEfectivo(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && confirmarMixto(pago)}
            placeholder="Ej: 30000"
            autoFocus
          />
        </label>
        {valido && (
          <p className="pagos-mixto-resto">
            Resto por transferencia: ${resto.toLocaleString("es-AR")}
          </p>
        )}
        {aviso && <p className="pagos-mixto-aviso">{aviso}</p>}
        <div className="panel-flotante-opciones">
          <button className="btn btn-primario" disabled={!valido} onClick={() => confirmarMixto(pago)}>
            Confirmar
          </button>
          <button className="btn btn-secundario" onClick={() => setModoMixto(false)}>
            Volver
          </button>
        </div>
      </>
    );
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
      const montoDelMetodo = partesDelPago(p)
        .filter((parte) => parte.metodo === filtroMetodo)
        .reduce((acc, parte) => acc + parte.monto, 0);
      mapa.set(clave, { total: anterior.total + montoDelMetodo, cantidad: anterior.cantidad + 1 });
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
      {error && (
        <p className="pagos-error" role="alert">
          {error}
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
                        <span className="pagos-metodo-texto">
                          {partesDelPago(pago).map((parte, i, arr) => (
                            <span key={parte.metodo}>
                              {arr.length > 1
                                ? `${parte.metodo} $${parte.monto.toLocaleString("es-AR")}`
                                : parte.metodo}
                            </span>
                          ))}
                        </span>
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
                        onCerrar={cerrarPanel}
                      >
                        {modoMixto ? (
                          renderFormMixto(pago)
                        ) : (
                          <>
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
                              <button
                                className="btn btn-secundario"
                                onClick={() => abrirMixto(pago)}
                              >
                                Pago mixto
                              </button>
                              {pago.estado === "registrado" && (
                                <button
                                  className="btn confirmar-boton-peligro"
                                  onClick={() => manejarDeshacer(pago.id)}
                                >
                                  Deshacer pago
                                </button>
                              )}
                            </div>
                          </>
                        )}
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