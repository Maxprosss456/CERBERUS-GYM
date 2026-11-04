const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase.from('Pagos').select('*');
  if (error) throw error;
  return data;
}

async function crear({socioId, monto, fecha, pagado, metodo}) {
  const { data, error } = await supabase
    .from('Pagos')
    .insert([{socioId, monto, fecha, pagado, metodo }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function borrar(id) {
  const { data, error } = await supabase
    .from('Pagos')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function actualizar(id, { socioId, monto, fecha, pagado, metodo}) {
  const { data, error } = await supabase
    .from('Pagos')
    .update({ socioId, monto, fecha, pagado, metodo })
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('Pagos')
    .select('*')
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function registrar(id, metodo, partes = null, fechaPago = null) {
  const cambios = { pagado: true, metodo, partes };
  if (fechaPago) cambios.fechaPago = fechaPago;
  const { data, error } = await supabase
    .from('Pagos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deshacer(id) {
  const { data, error } = await supabase
    .from('Pagos')
    .update({ pagado: false, metodo: null, partes: null, fechaPago: null })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, crear, borrar, actualizar, obtenerPorId, registrar, deshacer };