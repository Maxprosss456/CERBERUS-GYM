const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase
  .from('pagos')
  .select('*');
  if (error) throw error;
  return data;
}

async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function crear({ id_socio, monto, fecha_vencimiento }) {
  const { data, error } = await supabase
    .from('pagos')
    .insert([{
      id_socio,
      monto,
      fecha_vencimiento,
      monto_efectivo: 0,
      monto_transferencia: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function eliminar(id) {
  const { data, error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function eliminarNoPagados(idSocio) {
  const { data, error } = await supabase
    .from('pagos')
    .delete()
    .eq('id_socio', idSocio)
    .eq('pagado', false)
    .select();

  if (error) throw error;
  return data;
}

async function actualizar(id, {
  pagado,
  metodo,
  fecha_pago,
  monto_efectivo,
  monto_transferencia
}) {
  const { data, error } = await supabase
    .from('pagos')
    .update({
      pagado,
      metodo,
      fecha_pago,
      monto_efectivo,
      monto_transferencia
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function buscarSiguiente(idSocio, fecha) {
  const { data, error } = await supabase
    .from('pagos')
    .select('id, pagado')
    .eq('id_socio', idSocio)
    .gt('fecha_vencimiento', fecha)
    .order('fecha_vencimiento', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function buscarPorSocioYFecha(idSocio, fecha) {
  const { data, error } = await supabase
    .from('pagos')
    .select('id')
    .eq('id_socio', idSocio)
    .eq('fecha_vencimiento', fecha)
    .maybeSingle();

  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, obtenerPorId, crear, eliminar, eliminarNoPagados, actualizar, buscarSiguiente, buscarPorSocioYFecha };