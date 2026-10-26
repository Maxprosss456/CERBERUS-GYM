const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase.from('Socios').select('*');
  if (error) throw error;
  return data;
}

async function crear({nombre, apellido, dni, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad}) {
  const { data, error } = await supabase
    .from('Socios')
    .insert([{nombre, apellido, dni, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad}])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function borrar(id) {
  const { data, error } = await supabase
    .from('Socios')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function actualizar(id, { nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad }) {
  const { data, error } = await supabase
    .from('Socios')
    .update({ nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad })
    .eq('id', id);
  if (error) throw error;
  return data;
}

async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from('Socios')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, crear, borrar, actualizar, obtenerPorId };