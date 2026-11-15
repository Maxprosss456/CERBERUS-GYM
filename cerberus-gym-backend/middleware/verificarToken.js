const jwt = require('jsonwebtoken');
const Usuarios = require('../modelo/modeloUsuarios.js');

function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Sesión no válida. Iniciá sesión de nuevo.' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión vencida. Iniciá sesión de nuevo.' });
  }
}

// Revalida el rol contra la BD: no alcanza con lo que dice el token
async function soloAdmin(req, res, next) {
  try {
    const actual = await Usuarios.buscarPorId(req.usuario.id);
    if (actual?.roles?.rol !== 'administrador') {
      return res.status(403).json({ error: 'No tenés permiso para hacer esto.' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'No se pudo verificar tu permiso.' });
  }
}

module.exports = { verificarToken, soloAdmin };