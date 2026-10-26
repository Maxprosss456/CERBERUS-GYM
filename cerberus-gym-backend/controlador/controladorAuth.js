function login(req, res) {
  const { usuario, password } = req.body ?? {};

  if (usuario === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }

  res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
}

module.exports = { login };