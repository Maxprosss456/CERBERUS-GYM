const CLAVE = "cerberus_gym_fechas_baja";

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? {};
  } catch {
    return {};
  }
}

export function registrarBaja(id, fechaISO) {
  const mapa = leer();
  mapa[id] = fechaISO;
  localStorage.setItem(CLAVE, JSON.stringify(mapa));
}

/** Devuelve la fecha de baja guardada. Si no hay, guarda y devuelve la de hoy. */
export function obtenerFechaBaja(id) {
  const mapa = leer();
  if (mapa[id]) return mapa[id];
  const hoy = new Date();
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  registrarBaja(id, fecha);
  return fecha;
}