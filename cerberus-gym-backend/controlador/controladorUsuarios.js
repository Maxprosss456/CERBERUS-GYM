const bcrypt = require('bcryptjs');
const Usuarios = require('../modelo/modeloUsuarios.js');

const ROLES_VALIDOS = ['administrador', 'empleado'];

function errorUsuario(usuario) {
  if (typeof usuario !== 'string') return 'Ingresá un nombre de usuario.';
  const limpio = usuario.trim();
  if (limpio.length < 3 || limpio.length > 30) {
    return 'El usuario debe tener entre 3 y 30 caracteres.';
  }
  if (/\s/.test(limpio)) return 'El usuario no puede tener espacios.';
  return null;
}

function errorPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return 'La contraseña debe tener entre 8 y 72 caracteres.';
  }
  return null;
}

function leerId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Importante: nunca responder 401 acá. El front interpreta un 401 como
// "sesión vencida" y desloguea al usuario (ver api.js).

async function listar(req, res) {
  try {
    res.json(await Usuarios.listar());
  } catch {
    res.status(500).json({ error: 'No se pudo cargar la lista de usuarios.' });
  }
}

async function crear(req, res) {
  try {
    const { usuario, password, rol } = req.body ?? {};

    const msgUsuario = errorUsuario(usuario);
    if (msgUsuario) return res.status(400).json({ error: msgUsuario });
    const msgPassword = errorPassword(password);
    if (msgPassword) return res.status(400).json({ error: msgPassword });
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: 'Elegí un rol válido.' });
    }

    const idRol = await Usuarios.obtenerIdRol(rol);
    if (!idRol) throw new Error('El rol no existe en la tabla roles.');

    const hash = await bcrypt.hash(password, 10);
    const creado = await Usuarios.crear({ usuario: usuario.trim(), password: hash, rol: idRol });
    res.status(201).json({ id: creado.id, usuario: creado.usuario, rol });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese nombre de usuario ya existe.' });
    }
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
}

async function actualizar(req, res) {
  try {
    const id = leerId(req);
    if (!id) return res.status(400).json({ error: 'Id de usuario inválido.' });

    const { usuario, rol, password } = req.body ?? {};
    const esPropio = id === req.usuario.id;
    const cambios = {};

    if (usuario !== undefined) {
      const msg = errorUsuario(usuario);
      if (msg) return res.status(400).json({ error: msg });
      cambios.usuario = usuario.trim();
    }

    if (rol !== undefined) {
      if (esPropio) return res.status(403).json({ error: 'No podés cambiar tu propio rol.' });
      if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: 'Elegí un rol válido.' });
      }
      const idRol = await Usuarios.obtenerIdRol(rol);
      if (!idRol) throw new Error('El rol no existe en la tabla roles.');
      cambios.rol = idRol;
    }

    if (password !== undefined) {
      if (esPropio) {
        return res.status(403).json({ error: 'Tu contraseña la cambiás desde "Cambiar mi contraseña".' });
      }
      const msg = errorPassword(password);
      if (msg) return res.status(400).json({ error: msg });
      cambios.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ error: 'No hay cambios para guardar.' });
    }

    const existente = await Usuarios.buscarPorId(id);
    if (!existente) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await Usuarios.actualizar(id, cambios);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese nombre de usuario ya existe.' });
    }
    res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }
}

async function eliminar(req, res) {
  try {
    const id = leerId(req);
    if (!id) return res.status(400).json({ error: 'Id de usuario inválido.' });
    if (id === req.usuario.id) {
      return res.status(403).json({ error: 'No podés borrar tu propio usuario.' });
    }

    const existente = await Usuarios.buscarPorId(id);
    if (!existente) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await Usuarios.eliminar(id);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'No se pudo borrar el usuario.' });
  }
}

module.exports = { listar, crear, actualizar, eliminar };