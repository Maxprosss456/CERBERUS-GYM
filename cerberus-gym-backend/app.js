const express = require('express');
const cors = require('cors');
const  RutasSocios= require('./rutas/rutasSocios');
const RutasPagos= require('./rutas/rutasPagos');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/socios', RutasSocios);
app.use('/pagos', RutasPagos);

module.exports = app;