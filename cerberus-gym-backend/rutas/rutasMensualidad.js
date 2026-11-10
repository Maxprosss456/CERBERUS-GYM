const express = require('express');
const controladorMensualidad = require('../controlador/controladorMensualidad.js');

const router = express.Router();

router.get('/', controladorMensualidad.obtenerMensualidad);
router.patch("/", controladorMensualidad.modificarMensualidad);

module.exports = router;