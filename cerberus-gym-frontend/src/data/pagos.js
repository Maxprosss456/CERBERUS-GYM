import { pagos as pagosMock } from "../mockData.js";
import { fechaVencimientoPrimeraCuota, fechaVencimientoSiguienteCiclo } from "../utils/fechas.js";

// ── Cuando el backend esté listo, ESTE es el único archivo a tocar. ──

export async function obtenerPagos() {
  return Promise.resolve(pagosMock);
}

export async function registrarPago(id, metodo) {
  // mock: simula un PUT/PATCH del backend, devolviendo el objeto ya mergeado
  // (misma convención que actualizarSocio en data/socios.js).
  return Promise.resolve({ id, pagado: true, metodo });
}

export async function crearPago(pago) {
  // mock: simula el POST del backend, devolviendo el pago ya con id.
  return Promise.resolve({ id: `pago_${Date.now()}`, ...pago });
}

export function armarPagoInicial(socio, precioMensualidad) {
  return {
    socioId: socio.id,
    monto: precioMensualidad,
    fecha: fechaVencimientoPrimeraCuota(socio.fechaAlta, socio.diaPago),
    pagado: false,
    metodo: null,
  };
}

export function armarPagoSiguienteCiclo(pagoPagado, socio, precioMensualidad) {
  return {
    socioId: socio.id,
    monto: precioMensualidad,
    fecha: fechaVencimientoSiguienteCiclo(pagoPagado.fecha, socio.diaPago),
    pagado: false,
    metodo: null,
  };
}