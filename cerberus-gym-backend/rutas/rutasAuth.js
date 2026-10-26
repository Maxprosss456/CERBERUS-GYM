const express = require('express');
const controladorAuth = require('../controlador/controladorAuth.js');

const router = express.Router();

router.post('/login', controladorAuth.login);

module.exports = router;