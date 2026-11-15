const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

    const rol = registro.roles?.rol ?? 'empleado';
    const token = jwt.sign(
      { id: registro.id, usuario: registro.usuario, rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ ok: true, id: registro.id, usuario: registro.usuario, rol, token });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
}

async function cambiarPassword(req, res) {
  try {
    const { passwordActual, passwordNueva } = req.body ?? {};

    if (typeof passwordActual !== 'string' || typeof passwordNueva !== 'string'
        || !passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Completá todos los campos.' });
    }
    if (passwordNueva.length < 8 || passwordNueva.length > 72) {
      return res.status(400).json({ error: 'La contraseña nueva debe tener entre 8 y 72 caracteres.' });
    }
    if (passwordNueva === passwordActual) {
      return res.status(400).json({ error: 'La contraseña nueva debe ser distinta de la actual.' });
    }

    const registro = await modeloAuth.buscarPorId(req.usuario.id);
    const coincide = registro && (await bcrypt.compare(passwordActual, registro.password));
    if (!coincide) {
      // 400 y no 401: un 401 haría que el front cierre la sesión (ver api.js)
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    const hash = await bcrypt.hash(passwordNueva, 10);
    await modeloAuth.actualizarPassword(registro.id, hash);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'No se pudo cambiar la contraseña.' });
  }
}

module.exports = { login, cambiarPassword };