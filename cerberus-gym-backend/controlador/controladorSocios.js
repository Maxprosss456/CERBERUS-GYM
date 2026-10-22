const Socios = require('../modelo/modeloSocios');

async function listarSocios(req, res) {
  try {
    const socios = await Socios.obtenerTodos();
    res.json(socios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearSocio(req, res) {
  try {
    const { dni, nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion } = req.body;
    const socio = await Socios.crear({ dni, nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion});
    res.status(201).json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function borrarSocio(req, res) {
  try {
    const { dni } = req.params;
    const socio = await Socios.borrar(dni);
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarSocio(req, res) {
  try {
    const { dni } = req.params;
    const { nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion } = req.body;
    const socio = await Socios.actualizar(dni, { nombre, apellido, telefono, email, fecha_asociacion, fecha_expiracion });
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerPorDni(req, res) {
  try {
    const { dni } = req.params;
    const socio = await Socios.obtenerPorDni(dni);
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarSocios, crearSocio, borrarSocio, actualizarSocio, obtenerPorDni };