const express = require('express');
const controladorPagos = require('../controlador/controladorPagos.js');

const router = express.Router();

router.get('/', controladorPagos.listarPagos);
router.post('/', controladorPagos.crearPago);
router.delete('/:id', controladorPagos.borrarPago);
router.patch('/:id', controladorPagos.actualizarPago);
router.get('/:id', controladorPagos.obtenerPagoPorId);
router.patch('/:id/registrar', controladorPagos.registrarPago);
router.patch('/:id/deshacer', controladorPagos.deshacerPago);

module.exports = router;