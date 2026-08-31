require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ejemplo: Obtener todos los usuarios de una tabla llamada "usuarios"
app.get('/api/usuarios', async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// Ejemplo: Insertar un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email } = req.body;

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

app.listen(PORT, () => {
  console.log(`Servidor con Supabase corriendo en http://localhost:${PORT}`);
});