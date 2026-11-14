const jwt = require('jsonwebtoken');

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

module.exports = { verificarToken };