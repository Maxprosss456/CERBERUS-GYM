const express = require('express');
const cors = require('cors');
const  RutasSocios= require('./rutas/rutasSocios');
const RutasPagos= require('./rutas/rutasPagos');
const RutasAuth = require('./rutas/rutasAuth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', RutasAuth);

app.use('/socios', RutasSocios);
app.use('/pagos', RutasPagos);

module.exports = app;