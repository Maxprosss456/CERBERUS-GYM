const Socios = require('../modelo/modeloSocios');
const Mensualidad = require('../modelo/modeloMensualidad');
const Pagos = require('../modelo/modeloPagos');
const { fechaVencimientoPrimeraCuota } = require('../utils/fechas');

function validarSocio({ dni, telefono }, { exigirDni }) {
  if (exigirDni && !/^\d{7,9}$/.test(String(dni ?? ''))) {
    return 'El DNI debe tener entre 7 y 9 dígitos.';
  }
  const tel = String(telefono ?? '');
  if (tel && !/^\d{10,15}$/.test(tel)) {
    return 'El teléfono debe tener entre 10 y 15 dígitos.';
  }
  return null;
}

async function listarSocios(req, res) {
  try {
    const socios = await Socios.obtenerTodos();
    res.json(socios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarActivos(req, res) {
  try {
    const socios = (await Socios.obtenerTodos()).filter(socio => socio.activo);
    res.json(socios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const socio = await Socios.obtenerPorId(id);
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearSocio(req, res) {
  let socio;

  try {
    const mensualidad = await Mensualidad.getMensualidad();

    socio = await Socios.crear(req.body);

    await Pagos.crear({
      id_socio: socio.id,
      monto: mensualidad,
      fecha_vencimiento: fechaVencimientoPrimeraCuota(
        socio.fecha_asociacion,
        socio.dia_pago
      ),
    });

    res.status(201).json(socio);
  } catch (error) {
    if (socio) await Socios.borrar(socio.id).catch(() => {});
    res.status(400).json({ error: error.message });
  }
}

async function borrarSocio(req, res) {
  try {
    const { id } = req.params;

    const socio = await Socios.borrar(id);
    await Pagos.eliminarNoPagados(id);

    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarSocio(req, res) {
  try {
    const errorValidacion = validarSocio(req.body, { exigirDni: false });
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const { id } = req.params;
    const { nombre, apellido, telefono, email, foto, nota, fecha_asociacion, dia_pago } = req.body;
    const socio = await Socios.actualizar(id, { nombre, apellido, telefono, email, foto, nota, fecha_asociacion, dia_pago});
    res.json(socio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarSocios, listarActivos, obtenerPorId, crearSocio, borrarSocio, actualizarSocio};