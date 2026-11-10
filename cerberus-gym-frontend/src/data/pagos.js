import { api } from "./api.js";
import { fechaLocalISO } from "../utils/fechas.js";

export function obtenerPagos() {
  return api("/pagos");
}

export function crearPago(pago) {
  return api("/pagos", { metodo: "POST", cuerpo: pago });
}

export function registrarPago(id, metodo, partes = null) {
  return api(`/pagos/${id}`, {
    metodo: "PATCH",
    cuerpo: {
      pagado: true,
      metodo,
      fecha_pago: fechaLocalISO(),
      partes,
    },
  });
}

export function deshacerPago(id) {
  return api(`/pagos/${id}`, {
    metodo: "PATCH",
    cuerpo: {
      pagado: false,
      metodo: null,
      fecha_pago: null,
      monto_efectivo: 0,
      monto_transferencia: 0,
    },
  });
}

export function eliminarPago(id) {
  return api(`/pagos/${id}`, { metodo: "DELETE" });
}

export async function buscarSiguiente(idSocio, fecha) {
  const { data, error } = await supabase
    .from('Pagos')
    .select('id, pagado')
    .eq('id_socio', idSocio)
    .gt('fecha_vencimiento', fecha)
    .order('fecha_vencimiento', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}