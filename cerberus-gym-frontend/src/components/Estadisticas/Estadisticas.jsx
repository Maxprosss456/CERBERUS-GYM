import { useMemo } from "react";
import { useDatos } from "../../context/datosContext.jsx";
import "./Estadisticas.css";
import { EFECTIVO, TRANSFERENCIA, partesDelPago } from "../../utils/metodosPago.js";
import { obtenerFechaBaja } from "../../utils/bajas.js";

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

// Fecha de baja del socio: si no hay una específica, se usa la última modificación
function fechaDeBaja(socio) {
  return (
    socio.fecha_baja ||
    obtenerFechaBaja(socio.id)
  );
}

// Fecha real en que se pagó (si el backend la manda)
function fechaRealDePago(pago) {
  return pago.fecha_pago;
}

// Fecha contable del pago: la real si existe, si no la que viene del backend
function fechaContable(pago) {
  return fechaRealDePago(pago);
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
    // ---------- Socios ----------
    
    const sociosNuevosMes = socios.filter((socio) =>
      dentroDelPeriodo(socio.fecha_asociacion, anioActual, mesActual)
    ).length;

    const sociosNuevosAnio = socios.filter((socio) =>
      dentroDelPeriodo(socio.fecha_asociacion, anioActual)
    ).length;

    const sociosConBaja = socios.filter((socio) => !estaActivo(socio));
    const totalBajas = sociosConBaja.length;

    const bajasMes = sociosConBaja.filter((socio) =>
      dentroDelPeriodo(fechaDeBaja(socio), anioActual, mesActual)
    ).length;

    const bajasAnio = sociosConBaja.filter((socio) =>
      dentroDelPeriodo(fechaDeBaja(socio), anioActual)
    ).length;

    // ---------- Pagos e ingresos ----------
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

    return {
      sociosNuevosMes,
      sociosNuevosAnio,
      bajasMes,
      bajasAnio,
      totalBajas,
      ingresosMes,
      ingresosAnio,
      efectivoMes,
      transferenciaMes,
      efectivoAnio,
      transferenciaAnio,
    };
  }, [socios, pagos, anioActual, mesActual]);

  const nombreMes = hoy.toLocaleDateString("es-AR", { month: "long" });

  return (
    <section className="estadisticas">
      <header className="estadisticas-encabezado">
        <h1>Estadísticas</h1>
        <p>
          Resumen de "{nombreMes}" en el "{anioActual}".
        </p>
      </header>

      <h2>Socios</h2>
      <div className="estadisticas-grilla">
        <Tarjeta titulo="Nuevos este mes" valor={estadisticas.sociosNuevosMes} />
        <Tarjeta titulo="Nuevos este año" valor={estadisticas.sociosNuevosAnio} />
        <Tarjeta titulo="Bajas este mes" valor={estadisticas.bajasMes} />
        <Tarjeta titulo="Bajas este año" valor={estadisticas.bajasAnio} />
        <Tarjeta titulo="Bajas totales" valor={estadisticas.totalBajas} />
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
        de la cuota que envía el backend. Los resultados históricos también
        dependen de que los registros anteriores sigan disponibles.
      </p>
    </section>
  );
}