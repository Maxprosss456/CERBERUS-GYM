const express = require('express');
const cors = require('cors');
const  RutasSocios= require('./rutas/rutasSocios');
const RutasPagos= require('./rutas/rutasPagos');
const RutasAuth = require('./rutas/rutasAuth');
const RutasMensualidad = require('./rutas/rutasMensualidad');
const RutasUsuarios = require('./rutas/rutasUsuarios');
const { verificarToken, soloAdmin } = require('./middleware/verificarToken');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', RutasAuth);
app.use('/mensualidad', verificarToken, RutasMensualidad);
app.use('/socios', verificarToken, RutasSocios);
app.use('/pagos', verificarToken, RutasPagos);
app.use('/usuarios', verificarToken, soloAdmin, RutasUsuarios);

module.exports = app;