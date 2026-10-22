const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase.from('Socios').select('*');
  if (error) throw error;
  return data;
}

async function crear({ dni, nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion}) {
  const { data, error } = await supabase
    .from('Socios')
    .insert([{ dni, nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion }])
    .select();
  if (error) throw error;
  return data;
}

async function borrar(dni) {
  const { data, error } = await supabase
    .from('Socios')
    .delete()
    .eq('dni', dni);
  if (error) throw error;
  return data;
}

async function actualizar(dni, { nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion }) {
  const { data, error } = await supabase
    .from('Socios')
    .update({ nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion })
    .eq('dni', dni);
  if (error) throw error;
  return data;
}

async function obtenerPorDni(dni) {
  const { data, error } = await supabase
    .from('Socios')
    .select('*')
    .eq('dni', dni)
    .single();
  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, crear, borrar, actualizar, obtenerPorDni };