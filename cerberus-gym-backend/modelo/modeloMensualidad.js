const supabase = require('../supabaseClient');

async function getMensualidad() {
    const { data, error } = await supabase
    .from('mensualidad')
    .select('mensualidad')
    .single();

    if (error) throw error;
    return data.mensualidad;
}

async function modificarMensualidad(mensualidad) {
    const { data, error } = await supabase
    .from('mensualidad')
    .update({ mensualidad })
    .eq('id', 1)
    .select()
    .single();

    if (error) throw error;
    if (!data) throw new Error("No se encontró el registro de mensualidad.");

    return data;
}

module.exports = { getMensualidad, modificarMensualidad };