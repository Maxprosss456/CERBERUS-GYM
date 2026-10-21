/** Devuelve siempre una lista de partes [{ metodo, monto }], sea pago simple o mixto. */
export function partesDelPago(pago) {
  if (Array.isArray(pago.partes) && pago.partes.length > 0) return pago.partes;
  if (pago.metodo) return [{ metodo: pago.metodo, monto: pago.monto }];
  return [];
}