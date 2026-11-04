import { useMemo } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import "./Estadisticas.css";
import { EFECTIVO, TRANSFERENCIA, partesDelPago } from "../../utils/metodosPago.js";

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

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
    const sociosNuevosMes = socios.filter((socio) =>
      dentroDelPeriodo(socio.fechaAlta, anioActual, mesActual)
    ).length;

    const sociosNuevosAnio = socios.filter((socio) =>
      dentroDelPeriodo(socio.fechaAlta, anioActual)
    ).length;

    // Solo se cuentan bajas si el registro trae fechaBaja.
    // El sistema actual elimina socios en vez de guardar un historial de bajas.
    const sociosConBaja = socios.filter((socio) => socio.fechaBaja);
    const bajasMes = sociosConBaja.filter((socio) =>
      dentroDelPeriodo(socio.fechaBaja, anioActual, mesActual)
    ).length;
    const bajasAnio = sociosConBaja.filter((socio) =>
      dentroDelPeriodo(socio.fechaBaja, anioActual)
    ).length;

    const pagosRealizados = pagos.filter((pago) => pago.pagado);

    // Si está disponible, usa la fecha real del pago. En los datos actuales
    // suele faltar; en ese caso usa la fecha de vencimiento como aproximación.
    const fechaContable = (pago) =>
      pago.fechaPago || pago.fecha_pagado || pago.fechaPagado || pago.fecha;

    const montoPago = (pago) =>
      partesDelPago(pago).reduce((t, p) => t + Number(p.monto || 0), 0);

    const ingresosMes = pagosRealizados
      .filter((pago) => dentroDelPeriodo(fechaContable(pago), anioActual, mesActual))
      .reduce((total, pago) => total + montoPago(pago), 0);

    const ingresosAnio = pagosRealizados
      .filter((pago) => dentroDelPeriodo(fechaContable(pago), anioActual))
      .reduce((total, pago) => total + montoPago(pago), 0);

    const ingresosPorMetodo = (lista, metodo) =>
      lista.reduce((total, pago) => {
        const montoMetodo = partesDelPago(pago)
          .filter((parte) => Number(parte.metodo) === metodo)
          .reduce((subtotal, parte) => subtotal + Number(parte.monto || 0), 0);

        return total + montoMetodo;
      }, 0);

    const pagosMesIngresos = pagosRealizados.filter((pago) =>
      dentroDelPeriodo(fechaContable(pago), anioActual, mesActual)
    );

    const pagosAnioIngresos = pagosRealizados.filter((pago) =>
      dentroDelPeriodo(fechaContable(pago), anioActual)
    );

    const efectivoMes = ingresosPorMetodo(pagosMesIngresos, EFECTIVO);
    const transferenciaMes = ingresosPorMetodo(pagosMesIngresos, TRANSFERENCIA);
    const efectivoAnio = ingresosPorMetodo(pagosAnioIngresos, EFECTIVO);
    const transferenciaAnio = ingresosPorMetodo(pagosAnioIngresos, TRANSFERENCIA);
    // Para clasificar puntualidad se necesita una fecha real de pago.
    const pagosConFechaReal = pagosRealizados.filter((pago) =>
      pago.fechaPago || pago.fecha_pagado || pago.fechaPagado
    );

    const pagosMes = pagosConFechaReal.filter((pago) =>
      dentroDelPeriodo(
        pago.fechaPago || pago.fecha_pagado || pago.fechaPagado,
        anioActual,
        mesActual
      )
    );

    const pagosAnio = pagosConFechaReal.filter((pago) =>
      dentroDelPeriodo(
        pago.fechaPago || pago.fecha_pagado || pago.fechaPagado,
        anioActual
      )
    );

    const aTiempo = (lista) =>
      lista.filter(
        (pago) =>
          fechaCorta(pago.fechaPago || pago.fecha_pagado || pago.fechaPagado) <=
          fechaCorta(pago.fecha)
      ).length;

    return {
      sociosNuevosMes,
      sociosNuevosAnio,
      bajasMes,
      bajasAnio,
      totalBajasDisponible: sociosConBaja.length,
      hayHistorialBajas: sociosConBaja.length > 0,
      ingresosMes,
      ingresosAnio,
      puntualidadDisponible: pagosConFechaReal.length > 0,
      pagosATiempoMes: aTiempo(pagosMes),
      pagosTardeMes: pagosMes.length - aTiempo(pagosMes),
      pagosATiempoAnio: aTiempo(pagosAnio),
      pagosTardeAnio: pagosAnio.length - aTiempo(pagosAnio),
      efectivoMes,
      transferenciaMes,
      efectivoAnio,
      transferenciaAnio,
    };
  }, [socios, pagos, anioActual, mesActual]);

  const nombreMes = hoy.toLocaleDateString("es-AR", { month: "long" });
  const etiquetaPuntualidadMes = estadisticas.puntualidadDisponible
    ? String(estadisticas.pagosATiempoMes)
    : "Sin datos";
  const etiquetaTardeMes = estadisticas.puntualidadDisponible
    ? String(estadisticas.pagosTardeMes)
    : "Sin datos";
  const etiquetaPuntualidadAnio = estadisticas.puntualidadDisponible
    ? String(estadisticas.pagosATiempoAnio)
    : "Sin datos";
  const etiquetaTardeAnio = estadisticas.puntualidadDisponible
    ? String(estadisticas.pagosTardeAnio)
    : "Sin datos";

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
          valor={estadisticas.hayHistorialBajas ? estadisticas.bajasMes : "Sin datos"}
        />
        <Tarjeta
          titulo="Bajas este año"
          valor={estadisticas.hayHistorialBajas ? estadisticas.bajasAnio : "Sin datos"}
        />
        <Tarjeta
          titulo="Bajas totales registradas"
          valor={
            estadisticas.hayHistorialBajas
              ? estadisticas.totalBajasDisponible
              : "Sin historial"
          }
        />
      </div>

      <h2>Pagos</h2>
      <div className="estadisticas-grilla">
        <Tarjeta
          titulo="Pagaron a tiempo este mes"
          valor={etiquetaPuntualidadMes}
          detalle="Se necesita la fecha real de pago para calcularlo."
        />
        <Tarjeta
          titulo="Pagaron tarde este mes"
          valor={etiquetaTardeMes}
          detalle="Se necesita la fecha real de pago para calcularlo."
        />
        <Tarjeta
          titulo="Pagaron a tiempo este año"
          valor={etiquetaPuntualidadAnio}
        />
        <Tarjeta
          titulo="Pagaron tarde este año"
          valor={etiquetaTardeAnio}
        />
      </div>

      <h2>Ingresos registrados</h2>
      <div className="estadisticas-grilla">
        <Tarjeta
          titulo="Ingresos del mes"
          valor={formatoMoneda.format(estadisticas.ingresosMes)}
        />
        <Tarjeta
          titulo="Efectivo este mes"
          valor={formatoMoneda.format(estadisticas.efectivoMes)}
        />
        <Tarjeta
          titulo="Transferencias este mes"
          valor={formatoMoneda.format(estadisticas.transferenciaMes)}
        />
        <Tarjeta
          titulo="Ingresos del año"
          valor={formatoMoneda.format(estadisticas.ingresosAnio)}
        />
        <Tarjeta
          titulo="Efectivo este año"
          valor={formatoMoneda.format(estadisticas.efectivoAnio)}
        />
        <Tarjeta
          titulo="Transferencias este año"
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