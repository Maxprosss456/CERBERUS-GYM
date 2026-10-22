const express = require('express');
const controladorPagos = require('../controlador/controladorPagos.js');

const router = express.Router();

router.get('/', controladorPagos.listarPagos);
router.post('/', controladorPagos.crearPago);
router.delete('/:id', controladorPagos.borrarPago);
router.put('/:id', controladorPagos.actualizarPago);
router.get('/:id', controladorPagos.obtenerPagoPorId);

module.exports = router;