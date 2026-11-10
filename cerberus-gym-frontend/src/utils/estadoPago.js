import { parseFechaISO, diasEntre } from "./fechas.js";


export function calcularEstadoPago(pago, hoy = new Date(), diasAnticipacion = 7) {
  if (pago.pagado) return "registrado";

  const vencimiento = parseFechaISO(pago.fecha_vencimiento);
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