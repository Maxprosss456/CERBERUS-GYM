import { socios as sociosMock } from "../mockData.js";

// ── Cuando el backend esté listo, ESTE es el único archivo a tocar. ──
// Reemplazar el cuerpo de cada función por el fetch correspondiente,
// manteniendo la misma forma de dato que ya devuelve el mock:
//
// export async function obtenerSocios() {
//   const res = await fetch("http://localhost:3000/api/socios");
//   return res.json();
// }

export async function obtenerSocios() {
  return Promise.resolve(sociosMock);
}

export async function crearSocio(nuevoSocio) {
  // mock: no persiste de verdad, solo simula la respuesta del backend.
  // "fechaAlta" ya viene resuelta desde el formulario (por defecto hoy,
  // pero editable para cargar socios que ya estaban antes del sistema).
  return Promise.resolve({ id: `soc_${Date.now()}`, ...nuevoSocio });
}

export async function actualizarSocio(id, cambios) {
  // mock: simula un PUT/PATCH del backend, devolviendo el objeto ya mergeado.
  return Promise.resolve({ id, ...cambios });
}
