const express = require('express');
const controladorSocios = require('../controlador/controladorSocios.js');

const router = express.Router();

router.get('/', controladorSocios.listarSocios);
router.post('/', controladorSocios.crearSocio);

module.exports = router;