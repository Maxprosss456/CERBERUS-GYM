import { useMemo } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import "./Estadisticas.css";
import { EFECTIVO, TRANSFERENCIA, partesDelPago } from "../../utils/metodosPago.js";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// Un socio está activo salvo que activo sea false, 0 o "false"
const estaActivo = (socio) =>
  socio.activo !== false && socio.activo !== 0 && socio.activo !== "false";

function fechaCorta(valor) {
  if (!valor) return "";
  return String(valor).slice(0, 10);
}

function dentroDelPeriodo(fecha, anio, mes = null) {
  const fechaISO = fechaCorta(fecha);
  if (!fechaISO) return false;

  const fechaAnio = Number(fechaISO.slice(0, 4));
  const fechaMes = Number(fechaISO.slice(5, 7));

  return fechaAnio === anio && (mes === null || fechaMes === mes + 1);
}

const fechaDeBaja = (socio) => socio.fechaBaja || socio.fecha_baja;
const fechaRealDePago = (pago) => pago.fechaPago || pago.fecha_pagado || pago.fechaPagado;
// Si no hay fecha real de pago, se usa la fecha de vencimiento como aproximación
const fechaContable = (pago) => fechaRealDePago(pago) || pago.fecha;

function Tarjeta({ titulo, valor, detalle }) {
  return (
    <article className="estadisticas-tarjeta">
      <h3>{titulo}</h3>
      <p className="estadisticas-valor">{valor}</p>
      {detalle && <small>{detalle}</small>}
    </article>
  );
}

export default function Estadisticas() {
  const { socios, pagos } = useDatos();
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth();

  const estadisticas = useMemo(() => {
    // ---------- Socios ----------
    // Los nuevos se cuentan sobre todos los socios (aunque después se hayan dado de baja)
    const sociosNuevosMes = socios.filter((socio) =>
      dentroDelPeriodo(socio.fechaAlta, anioActual, mesActual)
    ).length;

    const sociosNuevosAnio = socios.filter((socio) =>
      dentroDelPeriodo(socio.fechaAlta, anioActual)
    ).length;

    const sociosConBaja = socios.filter((socio) => !estaActivo(socio));
    const totalBajas = sociosConBaja.length;

    // Para separar bajas por mes/año hace falta que el socio traiga la fecha de baja
    const bajasConFecha = sociosConBaja.filter((socio) => fechaDeBaja(socio));
    const fechaBajaDisponible = totalBajas === 0 || bajasConFecha.length > 0;

    const bajasMes = bajasConFecha.filter((socio) =>
      dentroDelPeriodo(fechaDeBaja(socio), anioActual, mesActual)
    ).length;
    const bajasAnio = bajasConFecha.filter((socio) =>
      dentroDelPeriodo(fechaDeBaja(socio), anioActual)
    ).length;

    // ---------- Pagos ----------
    const pagosRealizados = pagos.filter((pago) => pago.pagado);

    const pagosMesIngresos = pagosRealizados.filter((pago) =>
      dentroDelPeriodo(fechaContable(pago), anioActual, mesActual)
    );
    const pagosAnioIngresos = pagosRealizados.filter((pago) =>
      dentroDelPeriodo(fechaContable(pago), anioActual)
    );

    const sumarMontos = (lista) =>
      lista.reduce((total, pago) => total + Number(pago.monto || 0), 0);

    const ingresosMes = sumarMontos(pagosMesIngresos);
    const ingresosAnio = sumarMontos(pagosAnioIngresos);

    const ingresosPorMetodo = (lista, metodo) =>
      lista.reduce((total, pago) => {
        const montoMetodo = partesDelPago(pago)
          .filter((parte) => String(parte.metodo) === String(metodo))
          .reduce((subtotal, parte) => subtotal + Number(parte.monto || 0), 0);
        return total + montoMetodo;
      }, 0);

    const efectivoMes = ingresosPorMetodo(pagosMesIngresos, EFECTIVO);
    const transferenciaMes = ingresosPorMetodo(pagosMesIngresos, TRANSFERENCIA);
    const efectivoAnio = ingresosPorMetodo(pagosAnioIngresos, EFECTIVO);
    const transferenciaAnio = ingresosPorMetodo(pagosAnioIngresos, TRANSFERENCIA);

    // ---------- Puntualidad (requiere fecha real de pago) ----------
    const pagosConFechaReal = pagosRealizados.filter((pago) => fechaRealDePago(pago));

    const pagosMes = pagosConFechaReal.filter((pago) =>
      dentroDelPeriodo(fechaRealDePago(pago), anioActual, mesActual)
    );
    const pagosAnio = pagosConFechaReal.filter((pago) =>
      dentroDelPeriodo(fechaRealDePago(pago), anioActual)
    );

    const aTiempo = (lista) =>
      lista.filter(
        (pago) => fechaCorta(fechaRealDePago(pago)) <= fechaCorta(pago.fecha)
      ).length;

    const pagosATiempoMes = aTiempo(pagosMes);
    const pagosATiempoAnio = aTiempo(pagosAnio);

    return {
      sociosNuevosMes,
      sociosNuevosAnio,
      bajasMes,
      bajasAnio,
      totalBajas,
      fechaBajaDisponible,
      ingresosMes,
      ingresosAnio,
      puntualidadDisponible: pagosConFechaReal.length > 0,
      pagosATiempoMes,
      pagosTardeMes: pagosMes.length - pagosATiempoMes,
      pagosATiempoAnio,
      pagosTardeAnio: pagosAnio.length - pagosATiempoAnio,
      efectivoMes,
      transferenciaMes,
      efectivoAnio,
      transferenciaAnio,
    };
  }, [socios, pagos, anioActual, mesActual]);

  const nombreMes = hoy.toLocaleDateString("es-AR", { month: "long" });

  const puntualidad = (valor) =>
    estadisticas.puntualidadDisponible ? String(valor) : "Sin datos";

  const bajasPeriodo = (valor) =>
    estadisticas.fechaBajaDisponible ? valor : "Sin datos";

  return (
    <section className="estadisticas">
      <header className="estadisticas-encabezado">
        <h1>Estadísticas</h1>
        <p>
          Resumen de {nombreMes} y {anioActual}.
        </p>
      </header>

      <h2>Socios</h2>
      <div className="estadisticas-grilla">
        <Tarjeta titulo="Nuevos este mes" valor={estadisticas.sociosNuevosMes} />
        <Tarjeta titulo="Nuevos este año" valor={estadisticas.sociosNuevosAnio} />
        <Tarjeta
          titulo="Bajas este mes"
          valor={bajasPeriodo(estadisticas.bajasMes)}
          detalle={
            estadisticas.fechaBajaDisponible
              ? undefined
              : "Se necesita la fecha de baja para calcularlo."
          }
        />
        <Tarjeta
          titulo="Bajas este año"
          valor={bajasPeriodo(estadisticas.bajasAnio)}
        />
        <Tarjeta titulo="Bajas totales" valor={estadisticas.totalBajas} />
      </div>

      <h2>Pagos</h2>
      <div className="estadisticas-grilla">
        <Tarjeta
          titulo="Pagaron a tiempo este mes"
          valor={puntualidad(estadisticas.pagosATiempoMes)}
          detalle={
            estadisticas.puntualidadDisponible
              ? undefined
              : "Se necesita la fecha real de pago para calcularlo."
          }
        />
        <Tarjeta
          titulo="Pagaron tarde este mes"
          valor={puntualidad(estadisticas.pagosTardeMes)}
        />
        <Tarjeta
          titulo="Pagaron a tiempo este año"
          valor={puntualidad(estadisticas.pagosATiempoAnio)}
        />
        <Tarjeta
          titulo="Pagaron tarde este año"
          valor={puntualidad(estadisticas.pagosTardeAnio)}
        />
      </div>

      <h2>Ingresos registrados</h2>
      <div className="estadisticas-grilla">
        <Tarjeta
          titulo="Ingresos del mes"
          valor={formatoMoneda.format(estadisticas.ingresosMes)}
        />
        <Tarjeta
          titulo="Ingresos del año"
          valor={formatoMoneda.format(estadisticas.ingresosAnio)}
        />
      </div>

      <h2>Ingresos por método de pago</h2>
      <div className="estadisticas-grilla">
        <Tarjeta
          titulo="Efectivo este mes"
          valor={formatoMoneda.format(estadisticas.efectivoMes)}
        />
        <Tarjeta
          titulo="Transferencia este mes"
          valor={formatoMoneda.format(estadisticas.transferenciaMes)}
        />
        <Tarjeta
          titulo="Efectivo este año"
          valor={formatoMoneda.format(estadisticas.efectivoAnio)}
        />
        <Tarjeta
          titulo="Transferencia este año"
          valor={formatoMoneda.format(estadisticas.transferenciaAnio)}
        />
      </div>

      <p className="estadisticas-nota">
        Los ingresos usan la fecha real de pago si existe; si no, usan la fecha
        de vencimiento de la cuota como aproximación. Los resultados históricos
        también dependen de que los registros anteriores sigan disponibles.
      </p>
    </section>
  );
}