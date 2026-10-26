const express = require('express');
const controladorSocios = require('../controlador/controladorSocios.js');

const router = express.Router();

router.get('/', controladorSocios.listarSocios);
router.post('/', controladorSocios.crearSocio);
router.delete('/:id', controladorSocios.borrarSocio);
router.patch('/:id', controladorSocios.actualizarSocio);
router.get('/:id', controladorSocios.obtenerPorId);

module.exports = router;