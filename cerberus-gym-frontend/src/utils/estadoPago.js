import { parseFechaISO, diasEntre } from "./fechas.js";

/**
 * Calcula el estado de un pago comparando su fecha de vencimiento
 * contra "hoy". Esto es a propósito: el estado NUNCA se guarda fijo,
 * siempre se deriva en el momento.
 *
 * @param {{ pagado: boolean, fecha: string }} pago
 * @param {Date} hoy
 * @param {number} diasAnticipacion cuántos días antes del vencimiento pasa de "aviso" a "próximo"
 * @returns {"registrado" | "pendiente" | "proximo" | "aviso"}
 */
export function calcularEstadoPago(pago, hoy = new Date(), diasAnticipacion = 7) {
  if (pago.pagado) return "registrado";

  const vencimiento = parseFechaISO(pago.fecha);
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (vencimiento < hoySinHora) return "pendiente";

  const diasRestantes = diasEntre(hoySinHora, vencimiento);
  return diasRestantes <= diasAnticipacion ? "proximo" : "aviso";
}

/** Devuelve la misma lista de pagos, agregando el campo `estado` ya calculado. */
export function conEstadoCalculado(pagos, hoy = new Date(), diasAnticipacion = 7) {
  return pagos.map((pago) => ({
    ...pago,
    estado: calcularEstadoPago(pago, hoy, diasAnticipacion),
  }));
}