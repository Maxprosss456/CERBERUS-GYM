const express = require('express');
const controladorAuth = require('../controlador/controladorAuth.js');
const { verificarToken } = require('../middleware/verificarToken');

const router = express.Router();

router.post('/login', controladorAuth.login);
router.patch('/password', verificarToken, controladorAuth.cambiarPassword);

module.exports = router;