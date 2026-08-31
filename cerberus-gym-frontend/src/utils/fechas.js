export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const MESES_ABREV = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const DIAS_SEMANA = ["Do", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

/** "YYYY-MM-DD" -> Date (hora local, evita corrimiento por UTC) */
export function parseFechaISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Date -> "YYYY-MM-DD" usando la fecha LOCAL (no UTC).
 * OJO: nunca usar `date.toISOString().slice(0, 10)` para esto — eso
 * convierte a UTC primero, y en husos horarios negativos (como
 * Argentina, UTC-3) puede devolver el día siguiente si es de noche.
 */
export function fechaLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatoFechaLarga(date) {
  return `${date.getDate()} - ${capitalizar(MESES[date.getMonth()])} - ${date.getFullYear()}`;
}

export function esMismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function diasEntre(desde, hasta) {
  const msPorDia = 1000 * 60 * 60 * 24;
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((fin - inicio) / msPorDia);
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Arma la grilla de un mes (6 semanas x 7 días) al estilo Google Calendar:
 * incluye los días finales del mes anterior y los iniciales del mes
 * siguiente para completar la grilla, marcados con `fueraDeMes: true`.
 */
export function generarGrillaMes(anio, mes) {
  const primerDiaMes = new Date(anio, mes, 1);
  const ultimoDiaMes = new Date(anio, mes + 1, 0);
  const offsetInicio = primerDiaMes.getDay(); // 0 = domingo

  const celdas = [];

  // Días del mes anterior para completar la primera semana
  for (let i = offsetInicio - 1; i >= 0; i--) {
    const fecha = new Date(anio, mes, -i);
    celdas.push({ fecha, fueraDeMes: true });
  }

  // Días del mes actual
  for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
    celdas.push({ fecha: new Date(anio, mes, dia), fueraDeMes: false });
  }

  // Completar hasta múltiplo de 7 con el mes siguiente
  while (celdas.length % 7 !== 0) {
    const ultima = celdas[celdas.length - 1].fecha;
    const siguiente = new Date(ultima);
    siguiente.setDate(siguiente.getDate() + 1);
    celdas.push({ fecha: siguiente, fueraDeMes: true });
  }

  return celdas;
}

/** Etiqueta del número de día: "1 ago" si es fin/inicio de mes distinto, si no solo el número */
export function etiquetaDia(fecha, esPrimerDiaVisible) {
  if (fecha.getDate() === 1 || esPrimerDiaVisible) {
    return `${fecha.getDate()} ${MESES_ABREV[fecha.getMonth()]}`;
  }
  return `${fecha.getDate()}`;
}

/** Ajusta un día de mes al último día válido de ese mes (ej. 31 en abril -> 30). */
export function clampDiaDelMes(anio, mes, dia) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  return Math.min(dia, ultimoDia);
}

/** Fecha de vencimiento (ISO) de un socio para un mes/año dado, según su día fijo de pago. */
export function fechaVencimientoDelMes(anio, mes, diaPago) {
  const dia = clampDiaDelMes(anio, mes, diaPago);
  return fechaLocalISO(new Date(anio, mes, dia));
}

/**
 * Fecha de vencimiento vigente de un pago: si ya está pagado, se
 * respeta la fecha histórica; si no, se recalcula en vivo usando el
 * día fijo de pago configurado en el socio (mes/año se toman de la
 * fecha ya cargada, el DÍA lo pisa el del socio).
 */
export function resolverFechaVencimiento(pago, socio) {
  if (pago.pagado || !socio?.diaPago) return pago.fecha;
  const original = parseFechaISO(pago.fecha);
  return fechaVencimientoDelMes(original.getFullYear(), original.getMonth(), socio.diaPago);
}