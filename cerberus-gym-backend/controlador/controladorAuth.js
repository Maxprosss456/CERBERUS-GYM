const bcrypt = require('bcryptjs');
const modeloAuth = require('../modelo/modeloAuth');

async function login(req, res) {
  try {
    const { usuario, password } = req.body ?? {};

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Completá usuario y contraseña.' });
    }

    const registro = await modeloAuth.buscarPorUsuario(usuario);
    const coincide = registro && (await bcrypt.compare(password, registro.password));

    if (!coincide) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
}

module.exports = { login };