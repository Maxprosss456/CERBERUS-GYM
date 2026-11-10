const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase.from('socios')
  .select('*');
  if (error) throw error;
  return data;
}

async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function crear({nombre, apellido, dni, telefono, email, foto, nota, fecha_asociacion, dia_pago}) {
  const { data, error } = await supabase
    .from('socios')
    .insert([{nombre, apellido, dni, telefono, email, foto, nota, fecha_asociacion, dia_pago}])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function borrar(id) {
  const { data, error } = await supabase
    .from('socios')
    .update({ activo: false })
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function eliminar(id) {
  const { data, error } = await supabase
    .from('socios')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function actualizar(id, { nombre, apellido, telefono, email, foto, nota, fecha_asociacion, dia_pago, }) {
  const { data, error } = await supabase
    .from('socios')
    .update({ nombre, apellido, telefono, email, foto, nota, fecha_asociacion, dia_pago })
    .eq('id', id);
  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, obtenerPorId, crear, borrar, eliminar, actualizar };