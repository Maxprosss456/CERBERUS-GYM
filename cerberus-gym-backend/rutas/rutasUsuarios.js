const express = require('express');
const controladorUsuarios = require('../controlador/controladorUsuarios.js');

const router = express.Router();

router.get('/', controladorUsuarios.listar);
router.post('/', controladorUsuarios.crear);
router.patch('/:id', controladorUsuarios.actualizar);
router.delete('/:id', controladorUsuarios.eliminar);

module.exports = router;