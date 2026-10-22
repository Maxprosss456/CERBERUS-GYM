require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor con Supabase corriendo en http://localhost:${PORT}`);
});