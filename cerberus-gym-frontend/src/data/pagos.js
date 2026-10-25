import { api } from "./api.js";
import { fechaVencimientoPrimeraCuota, fechaVencimientoSiguienteCiclo } from "../utils/fechas.js";

export function obtenerPagos() {
  return api("/pagos");
}

export function crearPago(pago) {
  return api("/pagos", { metodo: "POST", cuerpo: pago });
}

export function registrarPago(id, metodo, partes = null) {
  return api(`/pagos/${id}/registrar`, { metodo: "PATCH", cuerpo: { metodo, partes } });
}

export function deshacerPago(id) {
  return api(`/pagos/${id}/deshacer`, { metodo: "PATCH" });
}

export function eliminarPago(id) {
  return api(`/pagos/${id}`, { metodo: "DELETE" });
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