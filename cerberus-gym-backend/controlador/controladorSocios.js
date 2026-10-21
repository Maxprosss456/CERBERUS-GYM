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
    const { nombre, email } = req.body;
    const socio = await Socios.crear({ nombre, email });
    res.status(201).json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarSocios, crearSocio };