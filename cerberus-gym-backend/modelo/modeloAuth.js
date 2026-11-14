const supabase = require('../supabaseClient');

async function buscarPorUsuario(usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, usuario, password, roles(rol)')
    .eq('usuario', usuario)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function buscarPorId(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, password')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function actualizarPassword(id, passwordHash) {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ password: passwordHash })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  // Si Supabase bloquea el update por permisos, no da error: devuelve 0 filas
  if (!data?.length) throw new Error('No se pudo actualizar la contraseña.');
}

module.exports = { buscarPorUsuario, buscarPorId, actualizarPassword };