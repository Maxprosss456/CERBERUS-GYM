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