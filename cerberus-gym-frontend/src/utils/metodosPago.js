export const EFECTIVO = 1;
export const TRANSFERENCIA = 2;
export const MIXTO = 3;

const NOMBRES = {
  [EFECTIVO]: "Efectivo",
  [TRANSFERENCIA]: "Transferencia",
  [MIXTO]: "Mixto",
};

export const nombreMetodo = (id) => NOMBRES[id] ?? "—";

/** Devuelve siempre una lista de { metodo, monto }, sea pago simple o mixto. */
export function partesDelPago(pago) {
  if (Array.isArray(pago.partes) && pago.partes.length > 0) return pago.partes;
  return [{ metodo: pago.metodo, monto: pago.monto }];
}