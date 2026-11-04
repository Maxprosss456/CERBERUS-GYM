const Socios = require('../modelo/modeloSocios');

function validarSocio({ dni, telefono }, { exigirDni }) {
  if (exigirDni && !/^\d{7,9}$/.test(String(dni ?? ''))) {
    return 'El DNI debe tener entre 7 y 9 dígitos.';
  }
  const tel = String(telefono ?? '');
  if (tel && !/^\d{10,15}$/.test(tel)) {
    return 'El teléfono debe tener entre 10 y 15 dígitos.';
  }
  return null;
}

async function listarSocios(req, res) {
  try {
    const socios = await Socios.obtenerTodos();
    res.json(socios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

listarActivos = async (req, res) => {
  try {
    const socios = await Socios.obtenerActivos();
    res.json(socios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearSocio(req, res) {
  try {
    const errorValidacion = validarSocio(req.body, { exigirDni: true });
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const { dni, nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad } = req.body;
    const socio = await Socios.crear({ dni, nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad });
    res.status(201).json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function borrarSocio(req, res) {
  try {
    const { id } = req.params;
    const socio = await Socios.borrar(id);
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarSocio(req, res) {
  try {
    const errorValidacion = validarSocio(req.body, { exigirDni: false });
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const { id } = req.params;
    const { nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad } = req.body;
    const socio = await Socios.actualizar(id, { nombre, apellido, telefono, email, foto, nota, fechaAlta, diaPago, precioMensualidad });
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const socio = await Socios.obtenerPorId(id);
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarSocios, crearSocio, borrarSocio, actualizarSocio, obtenerPorId };