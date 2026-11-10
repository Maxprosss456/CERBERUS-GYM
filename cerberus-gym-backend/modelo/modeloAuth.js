const supabase = require('../supabaseClient');

async function buscarPorUsuario(usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('usuario, password')
    .eq('usuario', usuario)
    .maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = { buscarPorUsuario };