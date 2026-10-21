import { pagos as pagosMock } from "../mockData.js";
import { fechaVencimientoPrimeraCuota, fechaVencimientoSiguienteCiclo } from "../utils/fechas.js";

// ── Cuando el backend esté listo, ESTE es el único archivo a tocar. ──

export async function obtenerPagos() {
  return Promise.resolve(pagosMock);
}

export async function registrarPago(id, metodo, partes = null) {
  // mock: simula un PATCH del backend. `partes` solo viene en pagos mixtos.
  return Promise.resolve({ id, pagado: true, metodo, partes });
}

export async function crearPago(pago) {
  // mock: simula el POST del backend, devolviendo el pago ya con id.
  return Promise.resolve({ id: `pago_${Date.now()}`, ...pago });
}

export async function deshacerPago(id) {
  return Promise.resolve({ id, pagado: false, metodo: null, partes: null });
}

export async function eliminarPago(id) {
  // mock: simula borrar un pago en el backend
  return Promise.resolve(id);
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