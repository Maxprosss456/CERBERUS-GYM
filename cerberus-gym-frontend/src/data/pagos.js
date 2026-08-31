import { pagos as pagosMock } from "../mockData.js";

// El cálculo de fecha vigente (según el día fijo del socio) y de estado
// (pendiente/proximo/aviso/registrado) ahora se hace en vivo en App.jsx,
// para que reaccione al instante ante cambios de socio o configuración.

export async function obtenerPagos() {
  return Promise.resolve(pagosMock);
}

export async function registrarPago(id, metodo) {
  // mock: simula un PUT/PATCH del backend, devolviendo el objeto ya mergeado
  // (misma convención que actualizarSocio en data/socios.js).
  return Promise.resolve({ id, pagado: true, metodo });
}