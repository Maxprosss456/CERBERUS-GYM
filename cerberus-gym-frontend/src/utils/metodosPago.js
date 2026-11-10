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
  const partes = [];

  const efectivo = Number(pago.monto_efectivo || 0);
  const transferencia = Number(pago.monto_transferencia || 0);

  if (efectivo > 0) {
    partes.push({
      metodo: EFECTIVO,
      monto: efectivo,
    });
  }

  if (transferencia > 0) {
    partes.push({
      metodo: TRANSFERENCIA,
      monto: transferencia,
    });
  }

  return partes;
}