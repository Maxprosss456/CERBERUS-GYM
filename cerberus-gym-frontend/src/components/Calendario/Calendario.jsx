import { useMemo, useState } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import {
  DIAS_SEMANA,
  MESES,
  esMismoDia,
  etiquetaDia,
  fechaLocalISO,
  generarGrillaMes,
} from "../../utils/fechas.js";
import DiaDetalleModal from "./DiaDetalleModal.jsx";
import "./Calendario.css";

const CATEGORIAS = ["pendiente", "proximo", "aviso", "registrado"];
const CON_ICONO = new Set(["pendiente", "proximo"]);
const ETIQUETAS_ARIA = {
  pendiente: "Pagos vencidos",
  proximo: "Pagos por vencer",
  aviso: "Próximos vencimientos",
  registrado: "Pagos registrados",
};

export default function Calendario() {
  const { pagos, socios } = useDatos();
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const socioPorId = useMemo(() => {
    const mapa = new Map();
    socios.forEach((s) => mapa.set(s.id, s));
    return mapa;
  }, [socios]);

  // Agrupa TODOS los pagos por fecha y por categoría (pendiente/proximo/
  // aviso/registrado), así un mismo día puede combinar hasta dos a la vez
  // (en la práctica, siempre "registrado" + una de las otras tres, nunca
  // dos de las tres categorías "no pagadas" juntas, porque esas dependen
  // de comparar la misma fecha contra el mismo "hoy").
  const alertasPorFecha = useMemo(() => {
    const mapa = new Map();
    for (const pago of pagos) {
      const clave = pago.fecha;
      const actual = mapa.get(clave) ?? { pendiente: [], proximo: [], aviso: [], registrado: [] };
      actual[pago.estado]?.push(pago);
      mapa.set(clave, actual);
    }
    return mapa;
  }, [pagos]);

  const celdas = useMemo(() => generarGrillaMes(anio, mes), [anio, mes]);

  function irMesAnterior() {
    const nuevo = new Date(anio, mes - 1, 1);
    setAnio(nuevo.getFullYear());
    setMes(nuevo.getMonth());
  }

  function irMesSiguiente() {
    const nuevo = new Date(anio, mes + 1, 1);
    setAnio(nuevo.getFullYear());
    setMes(nuevo.getMonth());
  }

  function claveISO(fecha) {
    return fechaLocalISO(fecha);
  }

  const infoDiaSeleccionado = diaSeleccionado
    ? alertasPorFecha.get(claveISO(diaSeleccionado))
    : null;

  return (
    <div className="calendario-vista">
      <div className="calendario-header">
        <button className="calendario-flecha" onClick={irMesAnterior} aria-label="Mes anterior"> ‹ </button>
        <h2 className="calendario-titulo">
          {capitalizar(MESES[mes])} - {anio}
        </h2>
        <button className="calendario-flecha" onClick={irMesSiguiente} aria-label="Mes siguiente"> › </button>
      </div>

      <div className="calendario-grilla">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="calendario-dia-semana">
            {d}
          </div>
        ))}

        {celdas.map(({ fecha, fueraDeMes }, i) => {
          const esPrimerCeldaVisible = i === 0;
          const clave = claveISO(fecha);
          const info = alertasPorFecha.get(clave);
          const esHoy = esMismoDia(fecha, hoy);

          const categoriasConDatos = info ? CATEGORIAS.filter((cat) => info[cat].length > 0) : [];
          const esCombo = categoriasConDatos.length === 2;
          const soloUno = categoriasConDatos.length === 1 ? categoriasConDatos[0] : null;

          return (
            <button
              key={clave}
              className={
                "calendario-celda" +
                (fueraDeMes ? " calendario-celda-fuera" : "") +
                (esHoy ? " calendario-celda-hoy" : "") +
                (soloUno ? ` calendario-celda-${soloUno}` : "")
              }
              onClick={() => info && setDiaSeleccionado(fecha)}
              disabled={!info}
            >
              <span className="calendario-numero">{etiquetaDia(fecha, esPrimerCeldaVisible)}</span>

              {esCombo ? (
                <div className="calendario-split">
                  {categoriasConDatos.map((cat) => (
                    <div key={cat} className={`calendario-mitad calendario-mitad-${cat}`}>
                      {CON_ICONO.has(cat) && (
                        <span className={`calendario-icono calendario-icono-${cat}`} aria-label={ETIQUETAS_ARIA[cat]}>
                          !
                        </span>
                      )}
                      <span className="calendario-conteo">{info[cat].length}</span>
                    </div>
                  ))}
                </div>
              ) : (
                soloUno && (
                  <>
                    {CON_ICONO.has(soloUno) && (
                      <span className={`calendario-icono calendario-icono-${soloUno}`} aria-label={ETIQUETAS_ARIA[soloUno]}>
                        !
                      </span>
                    )}
                    <span className="calendario-conteo-centro">{info[soloUno].length}</span>
                  </>
                )
              )}
            </button>
          );
        })}
      </div>

      {diaSeleccionado && infoDiaSeleccionado && (
        <DiaDetalleModal
          fecha={diaSeleccionado}
          pagos={CATEGORIAS.flatMap((cat) => infoDiaSeleccionado[cat])}
          socioPorId={socioPorId}
          onCerrar={() => setDiaSeleccionado(null)}
        />
      )}
    </div>
  );
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}