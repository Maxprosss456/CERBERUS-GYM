function parseFechaISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fechaLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diaPagoValido(dia) {
  return Number.isInteger(Number(dia)) && Number(dia) >= 1 && Number(dia) <= 31;
}

/** Ajusta un día al último día válido del mes (31 en abril -> 30). */
function clampDiaDelMes(anio, mes, dia) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  return Math.min(Number(dia), ultimoDia);
}

/** mes: 0-11 */
function fechaVencimientoDelMes(anio, mes, diaPago) {
  if (!diaPagoValido(diaPago)) {
    throw new Error('El día de pago debe ser un número entre 1 y 31.');
  }
  const dia = clampDiaDelMes(anio, mes, diaPago);
  return fechaLocalISO(new Date(anio, mes, dia));
}

function fechaVencimientoSiguienteCiclo(fechaISO, diaPago) {
  const actual = parseFechaISO(fechaISO);
  let anio = actual.getFullYear();
  let mes = actual.getMonth() + 1;
  if (mes > 11) {
    mes = 0;
    anio += 1;
  }
  return fechaVencimientoDelMes(anio, mes, diaPago);
}

function fechaVencimientoPrimeraCuota(fechaAltaISO, diaPago) {
  const alta = parseFechaISO(fechaAltaISO);
  const candidato = parseFechaISO(
    fechaVencimientoDelMes(alta.getFullYear(), alta.getMonth(), diaPago)
  );

  // Si el día de pago cae el día del alta o antes, ese mes ya está cubierto.
  if (candidato <= alta) {
    return fechaVencimientoSiguienteCiclo(fechaLocalISO(candidato), diaPago);
  }
  return fechaLocalISO(candidato);
}

module.exports = {
  diaPagoValido,
  fechaVencimientoDelMes,
  fechaVencimientoSiguienteCiclo,
  fechaVencimientoPrimeraCuota,
};