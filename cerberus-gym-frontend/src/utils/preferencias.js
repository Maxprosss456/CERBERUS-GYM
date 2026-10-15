// Persistencia simple de preferencias de interfaz. En Electron, localStorage
// es válido (no es el mismo caso que un artifact en el navegador) — persiste
// en el perfil de usuario de la app entre reinicios.

const CLAVE_TAMANO_FUENTE = "cerberus_gym_tamano_fuente";

export const TAMANOS = ["Chica", "Mediana", "Grande"];
const PORCENTAJES = ["87.5%", "100%", "112.5%"]; // índice 0,1,2

export function obtenerTamanoFuenteGuardado() {
  const guardado = Number(localStorage.getItem(CLAVE_TAMANO_FUENTE));
  return Number.isInteger(guardado) && guardado >= 0 && guardado <= 2 ? guardado : 1;
}

export function aplicarTamanoFuente(indice) {
  document.documentElement.style.fontSize = PORCENTAJES[indice] ?? PORCENTAJES[1];
}

export function guardarTamanoFuente(indice) {
  localStorage.setItem(CLAVE_TAMANO_FUENTE, String(indice));
  aplicarTamanoFuente(indice);
}

const CLAVE_DIAS_ANTICIPACION = "cerberus_gym_dias_anticipacion_proximo";
export const DIAS_ANTICIPACION_DEFECTO = 7;

export function obtenerDiasAnticipacionGuardado() {
  const guardado = Number(localStorage.getItem(CLAVE_DIAS_ANTICIPACION));
  return Number.isInteger(guardado) && guardado > 0 ? guardado : DIAS_ANTICIPACION_DEFECTO;
}

export function guardarDiasAnticipacion(dias) {
  localStorage.setItem(CLAVE_DIAS_ANTICIPACION, String(dias));
}

const CLAVE_PRECIO_MENSUALIDAD = "cerberus_gym_precio_mensualidad";
export const PRECIO_MENSUALIDAD_DEFECTO = 15000;

export function obtenerPrecioMensualidadGuardado() {
  const guardado = Number(localStorage.getItem(CLAVE_PRECIO_MENSUALIDAD));
  return Number.isFinite(guardado) && guardado > 0 ? guardado : PRECIO_MENSUALIDAD_DEFECTO;
}

export function guardarPrecioMensualidad(precio) {
  localStorage.setItem(CLAVE_PRECIO_MENSUALIDAD, String(precio));
}