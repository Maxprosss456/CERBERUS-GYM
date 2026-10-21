const express = require('express');
const cors = require('cors');
const  RutasSocios= require('./rutas/rutasSocios');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/socios', RutasSocios);

module.exports = app;