const supabase = require('../supabaseClient');

async function listar() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, usuario, roles(rol)')
    .order('id', { ascending: true });
  if (error) throw error;
  return data.map((u) => ({ id: u.id, usuario: u.usuario, rol: u.roles?.rol ?? null }));
}

async function buscarPorId(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, usuario, roles(rol)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function obtenerIdRol(nombreRol) {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('rol', nombreRol)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function crear({ usuario, password, rol }) {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ usuario, password, rol })
    .select('id, usuario')
    .single();
  if (error) throw error;
  return data;
}

async function actualizar(id, cambios) {
  const { data, error } = await supabase
    .from('usuarios')
    .update(cambios)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  // Si un permiso bloquea el update, Supabase no da error: devuelve 0 filas
  if (!data?.length) throw new Error('No se pudo actualizar el usuario.');
}

async function eliminar(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('No se pudo borrar el usuario.');
}

module.exports = { listar, buscarPorId, obtenerIdRol, crear, actualizar, eliminar };