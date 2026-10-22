const express = require('express');
const controladorSocios = require('../controlador/controladorSocios.js');

const router = express.Router();

router.get('/', controladorSocios.listarSocios);
router.post('/', controladorSocios.crearSocio);
router.delete('/:dni', controladorSocios.borrarSocio);
router.put('/:dni', controladorSocios.actualizarSocio);
router.get('/:dni', controladorSocios.obtenerPorDni);

module.exports = router;