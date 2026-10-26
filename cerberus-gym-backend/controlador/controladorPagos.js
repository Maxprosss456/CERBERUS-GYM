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
    const {socioId, monto, fecha, pagado, metodo } = req.body;
    const pago = await Pagos.crear({socioId, monto, fecha, pagado, metodo });
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
    const { socioId, monto, fecha, pagado, metodo } = req.body;
    const pago = await Pagos.actualizar(id, { socioId, monto, fecha, pagado, metodo });
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

async function registrarPago(req, res) {
  try {
    const { metodo } = req.body;
    const pago = await Pagos.registrar(req.params.id, metodo);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deshacerPago(req, res) {
  try {
    const pago = await Pagos.deshacer(req.params.id);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarPagos, crearPago, borrarPago, actualizarPago, obtenerPagoPorId, registrarPago, deshacerPago };