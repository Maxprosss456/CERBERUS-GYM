const supabase = require('../supabaseClient');

async function obtenerTodos() {
  const { data, error } = await supabase.from('Pagos').select('*');
  if (error) throw error;
  return data;
}

async function crear({ dni_socio, fecha_pagado, metodo_pago, monto }) {
  const { data, error } = await supabase
    .from('Pagos')
    .insert([{ dni_socio, fecha_pagado, metodo_pago, monto }])
    .select();
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

async function actualizar(id, { dni_socio, fecha_pagado, metodo_pago, monto }) {
  const { data, error } = await supabase
    .from('Pagos')
    .update({ dni_socio, fecha_pagado, metodo_pago, monto })
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

module.exports = { obtenerTodos, crear, borrar, actualizar, obtenerPorId };