const supabase = require('../config/supabase');

async function obtenerTodos() {
  const { data, error } = await supabase.from('socios').select('*');
  if (error) throw error;
  return data;
}

async function crear({ nombre, dni, telefono, email, fecha_asociacion, fecha_expiracion, precio }) {
  const { data, error } = await supabase
    .from('socios')
    .insert([{ nombre, email }])
    .select();
  if (error) throw error;
  return data;
}

module.exports = { obtenerTodos, crear };