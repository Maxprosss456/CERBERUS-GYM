const Pagos = require('../modelo/modeloPagos');

async function listarPagos(req, res) {
  try {
    const pagos = await Pagos.obtenerTodos();
    res.json(pagos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearPago(req, res) {
  try {
    const { dni_socio, fecha_pagado, metodo_pago, monto } = req.body;
    const pago = await Pagos.crear({ dni_socio, fecha_pagado, metodo_pago, monto });
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function borrarPago(req, res) {
  try {
    const { id } = req.params;
    const pago = await Pagos.borrar(id);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarPago(req, res) {
  try {
    const { id } = req.params;
    const { dni_socio, fecha_pagado, metodo_pago, monto } = req.body;
    const pago = await Pagos.actualizar(id, { dni_socio, fecha_pagado, metodo_pago, monto });
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerPagoPorId(req, res) {
  try {
    const { id } = req.params;
    const pago = await Pagos.obtenerPorId(id);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarPagos, crearPago, borrarPago, actualizarPago, obtenerPagoPorId };